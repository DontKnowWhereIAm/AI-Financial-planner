#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Doc_read.py

Reads a bank statement (PDF/CSV/XLS/XLSX), extracts transactions, sends ALL unique
descriptions in ONE Kronos Labs Hermes call to categorize them, and writes:
    Month, Date, Description, Amount, Category

Install:
  pip install pandas python-dateutil pdfplumber openpyxl kronoslabs

Run (PowerShell examples):
  $env:KRONOSLABS_API_KEY="YOUR_API_KEY"
  python Doc_read.py "C:\Users\ssvas\Downloads\bank_statement_ex.xlsx"
  # If your bank lists expenses as positive numbers:
  python Doc_read.py "C:\Users\ssvas\Downloads\bank_statement_ex.xlsx" --assume-positive-expenses
  # Custom output path:
  python Doc_read.py "C:\Users\ssvas\Downloads\bank_statement_ex.xlsx" --out "C:\Users\ssvas\Downloads\expenses_by_month.csv"
"""

from __future__ import annotations
import argparse, os, re, json
from pathlib import Path
from typing import List, Optional, Dict

import pandas as pd
from dateutil import parser as dateparser

# Optional (only for PDFs)
try:
    import pdfplumber
except Exception:
    pdfplumber = None

# ---- Categories (fixed list) ----
CATEGORIES = [
    "Housing","Food","Transportation","Education","Books",
    "Subscriptions","Entertainment","Healthcare","Insurance",
    "Savings","Other"
]

# ---- Column name candidates ----
DATE_CANDIDATES = [
    "date","post date","posting date","transaction date","trans date",
    "posted date","value date","statement date"
]
DESC_CANDIDATES = [
    "description","details","detail","memo","narrative","payee","merchant","transaction"
]
AMOUNT_CANDIDATES = ["amount","amt","transaction amount","value","amount ($)","amount usd"]
DEBIT_CANDIDATES  = ["debit","withdrawal","withdrawals","charges","spend","expense","debits"]
CREDIT_CANDIDATES = ["credit","deposit","deposits","payments","credits","income"]

# ---- Helpers ----
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [re.sub(r"\s+", " ", str(c)).strip().lower() for c in df.columns]
    return df

def find_col(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    cols = list(df.columns)
    for c in candidates:
        if c in cols: return c
    for c in candidates:
        for col in cols:
            if c in col: return col
    return None

def coerce_amount(x):
    if pd.isna(x): return None
    s = str(x).strip()
    if not s: return None
    neg = False
    if s.startswith("(") and s.endswith(")"):
        neg = True
        s = s[1:-1]
    s = re.sub(r"[^0-9.\-]", "", s)
    if s.count("-") > 1:
        s = s.replace("-", "")
        s = "-" + s
    try:
        val = float(s)
        return -abs(val) if neg else val
    except ValueError:
        return None

def coerce_date(x):
    if pd.isna(x): return None
    dt = pd.to_datetime(x, errors="coerce")
    if pd.isna(dt):
        try:
            return pd.to_datetime(dateparser.parse(str(x)))
        except Exception:
            return None
    return dt

def read_csv_or_excel(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        df = pd.read_csv(path)
    else:
        df = pd.read_excel(path)
    return normalize_columns(df)

def read_pdf_tables(path: Path) -> pd.DataFrame:
    if pdfplumber is None:
        raise RuntimeError("pdfplumber not installed. Run: pip install pdfplumber")
    rows = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            try:
                tables = page.extract_tables()
            except Exception:
                tables = []
            for tbl in tables or []:
                if not tbl or len(tbl) < 2: continue
                header = [re.sub(r"\s+", " ", (cell or "")).strip().lower() for cell in tbl[0]]
                for r in tbl[1:]:
                    if any(c is not None and str(c).strip() for c in r):
                        rows.append(dict(zip(header, r)))
    if not rows:
        raise ValueError("No tabular data found in PDF. Try exporting CSV/XLSX from your bank.")
    df = pd.DataFrame(rows)
    return normalize_columns(df)

def load_transactions(path: Path) -> pd.DataFrame:
    ext = path.suffix.lower()
    if ext in [".csv", ".xls", ".xlsx"]:
        df = read_csv_or_excel(path)
    elif ext == ".pdf":
        df = read_pdf_tables(path)
    else:
        raise ValueError("Unsupported file type. Use PDF, CSV, or Excel.")

    date_col   = find_col(df, DATE_CANDIDATES)
    desc_col   = find_col(df, DESC_CANDIDATES)
    amount_col = find_col(df, AMOUNT_CANDIDATES)
    debit_col  = find_col(df, DEBIT_CANDIDATES)
    credit_col = find_col(df, CREDIT_CANDIDATES)

    missing = []
    if not date_col: missing.append("date")
    if not desc_col: missing.append("description")
    if not (amount_col or debit_col or credit_col): missing.append("amount/debit/credit")
    if missing:
        raise ValueError(f"Couldn't detect: {', '.join(missing)}. Found columns: {list(df.columns)}")

    out = pd.DataFrame()
    out["Date"] = df[date_col].map(coerce_date)
    out["Description"] = df[desc_col].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()

    if amount_col:
        out["Amount"] = df[amount_col].map(coerce_amount)
    else:
        debit = df[debit_col].map(coerce_amount) if debit_col else None
        credit = df[credit_col].map(coerce_amount) if credit_col else None
        if debit is not None and credit is not None:
            out["Amount"] = credit.fillna(0) - debit.fillna(0)
        elif debit is not None:
            out["Amount"] = -debit
        elif credit is not None:
            out["Amount"] = credit
        else:
            raise ValueError("No usable amount/debit/credit columns detected.")

    out = out.dropna(subset=["Date", "Amount"])
    return out

def select_expenses(trans: pd.DataFrame, assume: Optional[str]) -> pd.DataFrame:
    if assume == "negative":
        exp = trans[trans["Amount"] < 0]
    elif assume == "positive":
        exp = trans[trans["Amount"] > 0].copy()
        exp["Amount"] = -exp["Amount"].abs()
    else:
        neg_ct = (trans["Amount"] < 0).sum()
        pos_ct = (trans["Amount"] > 0).sum()
        if neg_ct > 0:
            exp = trans[trans["Amount"] < 0]
        elif pos_ct > 0:
            exp = trans[trans["Amount"] > 0].copy()
            exp["Amount"] = -exp["Amount"].abs()
        else:
            exp = trans.iloc[0:0].copy()
    return exp

# ---- Hermes one-call categorization ----
def categorize_with_hermes(descriptions: List[str], api_key: str) -> Dict[str, str]:
    from kronoslabs import KronosLabs

    payload = {
        "task": "categorize_expense_descriptions",
        "categories": CATEGORIES,
        "instructions": (
            "For each description, pick exactly one category from 'categories'. "
            "Return a JSON object mapping the EXACT description string to a category. "
            "If none fits, use 'Other'. Output ONLY JSON, no prose."
        ),
        "descriptions": descriptions
    }
    prompt = (
        "You are a classifier. Read the following JSON and return ONLY a JSON object "
        "where each key is a description and each value is one of the allowed categories.\n\n"
        f"{json.dumps(payload, ensure_ascii=False)}"
    )

    client = KronosLabs(api_key=api_key)
    resp = client.chat.completions.create(
        prompt=prompt,
        model="hermes",
        temperature=0.0,
        is_stream=False
    )
    text = resp.choices[0].message.content.strip()

    # Try to parse JSON (strip code fences if present)
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE | re.DOTALL).strip()

    try:
        data = json.loads(text)
        if not isinstance(data, dict):
            raise ValueError("Hermes response is not a JSON object.")
    except Exception:
        # Fallback: mark all as Other
        return {d: "Other" for d in descriptions}

    allowed = set(CATEGORIES)
    clean = {}
    for d in descriptions:
        cat = data.get(d, "Other")
        if cat not in allowed:
            cat = "Other"
        clean[d] = cat
    return clean

def main():
    ap = argparse.ArgumentParser(description="Parse a bank statement and categorize expenses with Hermes (one call).")
    ap.add_argument("input", help="Path to statement (PDF/CSV/XLS/XLSX)")
    ap.add_argument("--out", help="Output CSV path (default: <stem>_expenses_by_month.csv)")
    ap.add_argument("--assume-positive-expenses", action="store_true", help="Force: positive amounts are expenses.")
    ap.add_argument("--assume-negative-expenses", action="store_true", help="Force: negative amounts are expenses.")
    ap.add_argument("--api-key", help="Kronos Labs API key (or set env KRONOSLABS_API_KEY)")
    args = ap.parse_args()

    in_path = Path(args.input.strip('"').strip("'"))
    if not in_path.exists():
        raise FileNotFoundError(f"File not found: {in_path}")

    api_key = args.api_key or os.getenv("KRONOSLABS_API_KEY")
    if not api_key:
        raise RuntimeError("Missing API key. Pass --api-key or set KRONOSLABS_API_KEY.")

    trans = load_transactions(in_path)

    assume = "positive" if args.assume_positive_expenses else ("negative" if args.assume_negative_expenses else None)
    expenses = select_expenses(trans, assume=assume)

    if expenses.empty:
        out_path = Path(args.out) if args.out else in_path.with_name(in_path.stem + "_expenses_by_month.csv")
        pd.DataFrame(columns=["Month","Date","Description","Amount","Category"]).to_csv(out_path, index=False)
        print(f"No expenses detected. Wrote empty file: {out_path.resolve()}")
        return

    # Hermes categorization (ONE call over unique descriptions)
    unique_desc = sorted(expenses["Description"].astype(str).unique())
    mapping = categorize_with_hermes(unique_desc, api_key=api_key)

    expenses = expenses.copy()
    expenses["Category"] = expenses["Description"].map(lambda d: mapping.get(str(d), "Other"))
    expenses["Month"] = expenses["Date"].dt.to_period("M").astype(str)

    out_df = expenses.sort_values(["Month","Date","Description"])[["Month","Date","Description","Amount","Category"]]
    out_path = Path(args.out) if args.out else in_path.with_name(in_path.stem + "_expenses_by_month.csv")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(out_path, index=False)

    print(f"Wrote {len(out_df)} rows to: {out_path.resolve()}")
    print("Categories:", ", ".join(CATEGORIES))

if __name__ == "__main__":
    main()
