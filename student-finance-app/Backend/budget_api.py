#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
budget_api.py
-------------
FastAPI backend for the Student Financial Planner.

Provides:
  ✅ /api/budget/summary – totals per category + total spent/income
  ✅ /api/budget/rows    – individual transaction rows (from latest CSV)
"""

from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pandas as pd
import glob
from uuid import uuid4


# -------------------------
# Initialize FastAPI + CORS
# -------------------------
app = FastAPI(title="Student Financial Planner API")

# Allow localhost access from React/Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev; tighten later if deploying
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Constants
# -------------------------
CATEGORIES = [
    "Housing", "Food", "Transportation", "Education", "Books",
    "Subscriptions", "Entertainment", "Healthcare", "Insurance",
    "Savings", "Other"
]


# -------------------------
# Helpers
# -------------------------
def _test_docs_dir() -> Path:
    """Return ../Test_documents relative to Backend/"""
    backend_dir = Path(__file__).resolve().parent
    return backend_dir.parent / "Test_documents"


def _latest_csv() -> Path | None:
    """Find the most recent *_transactions_by_month.csv file"""
    td = _test_docs_dir()
    td.mkdir(parents=True, exist_ok=True)
    candidates = sorted(glob.glob(str(td / "*_transactions_by_month.csv")))
    if not candidates:
        return None
    return Path(candidates[-1])


# -------------------------
# Routes
# -------------------------
@app.get("/api/budget/summary")
def budget_summary():
    """
    Return totals per category and total spent/income
    based on the latest CSV file in Test_documents.
    """
    csv_path = _latest_csv()
    if not csv_path or not csv_path.exists():
        return {
            "file": None,
            "totals_by_category": {c: 0.0 for c in CATEGORIES},
            "total_spent": 0.0,
            "total_income": 0.0,
        }

    df = pd.read_csv(csv_path)
    # Expect columns: Month, Date, Description, Amount, Category
    df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")
    df = df.dropna(subset=["Amount", "Category"])

    # Split expenses and income
    expenses = df[df["Amount"] < 0].copy()
    expenses["abs"] = expenses["Amount"].abs()
    income = df[df["Amount"] > 0].copy()

    # Totals per category (ensure all exist)
    by_cat = expenses.groupby("Category")["abs"].sum().to_dict()
    totals_by_category = {c: float(by_cat.get(c, 0.0)) for c in CATEGORIES}

    total_spent = float(expenses["abs"].sum()) if not expenses.empty else 0.0
    total_income = float(income["Amount"].sum()) if not income.empty else 0.0

    return {
        "file": str(csv_path),
        "totals_by_category": totals_by_category,
        "total_spent": total_spent,
        "total_income": total_income,
    }


@app.get("/api/budget/rows")
def budget_rows():
    """
    Return individual transaction rows for the latest CSV file,
    formatted for Expenses.jsx:
      id, category, amount, date, description
    """
    csv_path = _latest_csv()
    if not csv_path or not csv_path.exists():
        return {"file": None, "rows": []}

    df = pd.read_csv(csv_path)
    df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")
    df = df.dropna(subset=["Amount", "Category", "Description", "Date"])

    # Only include expenses (negative amounts)
    exp = df[df["Amount"] < 0].copy()
    exp["amount"] = exp["Amount"].abs()
    exp["category"] = exp["Category"]
    exp["date"] = pd.to_datetime(exp["Date"], errors="coerce").dt.strftime("%Y-%m-%d")
    exp["description"] = exp["Description"]
    exp["id"] = [str(uuid4()) for _ in range(len(exp))]

    rows = exp[["id", "category", "amount", "date", "description"]].to_dict(orient="records")

    return {"file": str(csv_path), "rows": rows}

# In budget_api.py
from fastapi import UploadFile, File, Form, HTTPException
import shutil
import os

# Import the callable you just added
from Doc_read import process_statement

@app.post("/api/upload/statement")
async def upload_statement(
    file: UploadFile = File(...),
    mode: str = Form("all"),           # "all" or "expenses"
    assume: str | None = Form(None),   # None | "positive" | "negative"
    api_key: str | None = Form(None)   # optional override; else env var
):
    try:
        # 1) save uploaded file
        base_dir = _test_docs_dir() / "uploads"
        base_dir.mkdir(parents=True, exist_ok=True)
        dest = base_dir / file.filename

        with dest.open("wb") as out:
            shutil.copyfileobj(file.file, out)

        # 2) resolve API key
        key = api_key or os.getenv("KRONOSLABS_API_KEY")
        if not key:
            raise HTTPException(status_code=400, detail="Missing API key (set KRONOSLABS_API_KEY or pass api_key).")

        # 3) call your processor
        result = process_statement(
            input_path=dest,
            api_key=key,
            mode=mode,
            assume=assume,
            out_dir=_test_docs_dir()     # write CSV into ../Test_documents
        )

        return {
            "ok": True,
            "input_file": str(dest),
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# Run directly (dev mode)
# -------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
