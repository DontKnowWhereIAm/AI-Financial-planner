#!/usr/bin/env python3
# -*- coding: utf-8 -*-

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

# ---- Fixed categories ----
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
AMOUNT_CANDIDATES = ["amount","amt","transaction amount","value","amount usd","amount $"]

# Add common debit/credit names + misspellings:
DEBIT_CANDIDATES  = [
    "debit","withdrawal","withdrawals","withdrawl","withdrawls",
    "withdraw","charge","charges","spend","expense","debits","withdrawals amount"
]
CREDIT_CANDIDATES = [
    "credit","credits","deposit","deposits","payment","payments","income"
]

# ---- Helpers ----
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Lowercase, trim, remove punctuation, and fix common misspellings."""
    df = df.copy()

    def _norm(h: str) -> str:
        s = re.sub(r"\s+", " ", str(h)).strip().lower()
        s = re.sub(r"[^\w\s]", "", s)  # drop punctuation like '.' in 'Ref.'
        # fix common misspellings/variants
        s = s.replace("withdrawls", "withdrawals").replace("withdrawl", "withdrawal")
        s = s.replace("postdate", "post date")
        return s

    df.columns = [_norm(c) for c in df.columns]
    return df

def find_col(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    cols = list(df.columns)
    # exact first
    for c in candidates:
        if c in cols:
            return c
    # then fuzzy contains
    for c in candidates:
        for col in cols:
            if c in col:
                return col
    return None

def coerce_amount(x):
    if pd.isna(x):
        return None
    s = str(x).strip()
    if not s:
        return None
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
    if pd.isna(x):
        return None
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
                if not tbl or len(tbl) < 2:
                    continue
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
        debit  = df[debit_col].map(coerce_amount) if debit_col else None
        credit = df[credit_col].map(coerce_amount) if credit_col else None
        if debit is not None and credit is not None:
            out["Amount"] = (credit.fillna(0) - debit.fillna(0)).astype(float)
        elif debit is not None:
            out["Amount"] = -debit.astype(float)
        elif credit is not None:
            out["Amount"] = credit.astype(float)
        else:
            raise ValueError("No usable amount/debit/credit columns detected.")

    out = out.dropna(subset=["Date", "Amount"])
    return out

def select_transactions(trans: pd.DataFrame, assume: Optional[str], mode: str = "all") -> pd.DataFrame:
    """
    mode: "all" -> include both withdrawals and deposits
          "expenses" -> only withdrawals (legacy behavior)
    """
    if mode == "expenses":
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

    # mode == "all"
    tx = trans[trans["Amount"] != 0].copy()
    return tx

# ---- Description normalization to make model outputs consistent ----
_DESC_NUMBER_PAT = re.compile(r"\b\d{2,}\b")
_DESC_CARD_PAT   = re.compile(r"(?:card|acct|account|x{0,2}\d{2,})\s*\d+", re.I)
_DESC_DATE_PAT   = re.compile(r"\b(?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b")

def normalize_description_for_model(s: str) -> str:
    s = str(s).strip()
    s = re.sub(r"\s+", " ", s)
    s = _DESC_CARD_PAT.sub("", s)
    s = _DESC_DATE_PAT.sub("", s)
    s = _DESC_NUMBER_PAT.sub("", s)
    return re.sub(r"\s+", " ", s).strip().upper()

# ---- Hermes categorization (batched + retries) ----
def _parse_possible_json_block(text: str) -> Optional[dict]:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t, flags=re.I | re.S).strip()
    try:
        data = json.loads(t)
        return data if isinstance(data, dict) else None
    except Exception:
        return None

def categorize_with_hermes(descriptions: List[str], api_key: str, batch_size: int = 150, max_retries: int = 2) -> Dict[str, str]:
    """
    Sends normalized descriptions in batches, maps back to originals.
    """
    from kronoslabs import KronosLabs
    client = KronosLabs(api_key=api_key)

    # Normalize for the model; keep mapping to originals
    norm_map = {d: normalize_description_for_model(d) for d in descriptions}
    inv_norm: Dict[str, List[str]] = {}
    for orig, norm in norm_map.items():
        inv_norm.setdefault(norm, []).append(orig)

    norm_unique = sorted(set(norm_map.values()))
    out_mapping: Dict[str, str] = {}

    for i in range(0, len(norm_unique), batch_size):
        chunk = norm_unique[i:i+batch_size]

        payload = {
            "task": "categorize_expense_descriptions",
            "categories": CATEGORIES,
            "instructions": (
                "For each description, pick exactly one category from 'categories'. "
                "Return a JSON object mapping the EXACT description string to a category. "
                "If none fits, use 'Other'. Output ONLY JSON, no prose."
            ),
            "descriptions": chunk
        }
        prompt = (
            "You are a classifier. Read the following JSON and return ONLY a JSON object "
            "where each key is a description and each value is one of the allowed categories.\n\n"
            f"{json.dumps(payload, ensure_ascii=False)}"
        )

        last_err = None
        for attempt in range(max_retries + 1):
            try:
                resp = client.chat.completions.create(
                    prompt=prompt,
                    model="hermes",
                    temperature=0.0,
                    is_stream=False
                )
                text = (resp.choices[0].message.content or "").strip()
                data = _parse_possible_json_block(text)
                if not data:
                    raise ValueError("Hermes did not return valid JSON.")
                allowed = set(CATEGORIES)
                for nd in chunk:
                    cat = data.get(nd, "Other")
                    if cat not in allowed:
                        cat = "Other"
                    for orig in inv_norm.get(nd, []):
                        out_mapping[orig] = cat
                break  # success
            except Exception as e:
                last_err = e
                if attempt < max_retries:
                    continue
                # Final failure for this chunk -> mark as Other
                for nd in chunk:
                    for orig in inv_norm.get(nd, []):
                        out_mapping[orig] = "Other"
        if last_err:
            print(f"[WARN] Hermes chunk {i//batch_size+1} failed: {last_err}")

    # Ensure all originals exist
    for d in descriptions:
        out_mapping.setdefault(d, "Other")
    return out_mapping

def main():
    ap = argparse.ArgumentParser(description="Parse a bank statement and categorize transactions with Hermes (one call, batched).")
    ap.add_argument("input", help="Path to statement (PDF/CSV/XLS/XLSX)")
    ap.add_argument("--assume-positive-expenses", action="store_true", help="Legacy: treat positive amounts as expenses (only if --mode expenses).")
    ap.add_argument("--assume-negative-expenses", action="store_true", help="Legacy: treat negative amounts as expenses (only if --mode expenses).")
    ap.add_argument("--mode", choices=["all","expenses"], default="all", help="all = deposits + withdrawals (default), expenses = withdrawals only")
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
    tx = select_transactions(trans, assume=assume, mode=args.mode)

    if tx.empty:
        print("⚠️ No transactions detected.")
        return

    # Hermes categorization
    unique_desc = sorted(tx["Description"].astype(str).unique())
    mapping = categorize_with_hermes(unique_desc, api_key=api_key)

    tx = tx.copy()
    tx["Category"] = tx["Description"].map(lambda d: mapping.get(str(d), "Other"))
    tx["Month"] = tx["Date"].dt.to_period("M").astype(str)

    out_df = tx.sort_values(["Month","Date","Description"])[["Month","Date","Description","Amount","Category"]]

    # --- 🔹 Save to your fixed folder ---
    output_dir = Path(r"../Test_documents")
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / (in_path.stem + "_transactions_by_month.csv")

    out_df.to_csv(out_path, index=False)

    print(f"✅ Wrote {len(out_df)} rows to: {out_path.resolve()}")
    print("Categories:", ", ".join(CATEGORIES))


if __name__ == "__main__":
    main()
