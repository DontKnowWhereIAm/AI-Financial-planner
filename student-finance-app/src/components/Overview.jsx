// Overview.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Stethoscope, Hospital, Coins, University, DollarSign, TrendingUp, TrendingDown, PieChart, BookOpen, Home, Utensils, ShoppingBag, CreditCard, Car, Repeat } from 'lucide-react';
import './Overview.css';
import savedSchool from "./savedSchools.json";

const CATEGORY_ORDER = [
  "Housing","Food","Transportation","Education","Books",
  "Subscriptions","Entertainment","Healthcare","Insurance",
  "Savings","Other"
];

const CATEGORY_ICONS = {
  Education: University,
  Books: BookOpen,
  Housing: Home,
  Healthcare: Hospital,
  Insurance: Stethoscope,
  Savings: Coins,
  Entertainment: ShoppingBag,
  Food: Utensils,
  Transportation: Car,
  Subscriptions: Repeat,
  Other: CreditCard
};

export default function Overview({ expenses = [] }) {
  const school = savedSchool?.database?.School;
  const hasSchool = Boolean(school);
  const MONTHLY_BUDGET = 3000;

  // from CSV summary endpoint
  const [serverTotals, setServerTotals] = useState({});
  const [serverSpent, setServerSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("http://localhost:8000/api/budget/summary");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setServerTotals(data.totals_by_category || {});
        setServerSpent(Number(data.total_spent || 0));
      } catch (e) {
        setErr(String(e));
        setServerTotals({});
        setServerSpent(0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // compute totals from the UI-added expenses list
  const uiTotals = useMemo(() => {
    const acc = Object.fromEntries(CATEGORY_ORDER.map(c => [c, 0]));
    for (const e of expenses) {
      const cat = e.category && CATEGORY_ORDER.includes(e.category) ? e.category : "Other";
      const amt = Number(e.amount || 0);
      // UI list treats amounts as POSITIVE expenses
      acc[cat] += Math.max(0, amt);
    }
    return acc;
  }, [expenses]);

  // combine server (CSV) + UI totals
  const combinedTotals = useMemo(() => {
    const out = {};
    for (const c of CATEGORY_ORDER) {
      out[c] = Number(serverTotals?.[c] || 0) + Number(uiTotals?.[c] || 0);
    }
    return out;
  }, [serverTotals, uiTotals]);

  const spent = useMemo(() => {
    // total spent = sum of all category totals
    return CATEGORY_ORDER.reduce((s, c) => s + Number(combinedTotals[c] || 0), 0);
  }, [combinedTotals]);

  const budget = { total: MONTHLY_BUDGET, spent, remaining: MONTHLY_BUDGET - spent };
  const progressPercent = budget.total ? (budget.spent / budget.total) * 100 : 0;
  let progressClass = 'green';
  if (progressPercent > 90) progressClass = 'red';
  else if (progressPercent > 70) progressClass = 'yellow';

  if (loading) return <div className="card"><p>Loading overview…</p></div>;
  if (err) return <div className="card"><p style={{color:'crimson'}}>Failed to load CSV summary: {err}</p></div>;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card indigo">
          <div className="stat-header">
            <span className="stat-title">Monthly Budget</span>
            <DollarSign style={{color: '#4f46e5'}} size={24} />
          </div>
          <p className="stat-value">${budget.total.toFixed(2)}</p>
        </div>

        <div className="stat-card rose">
          <div className="stat-header">
            <span className="stat-title">Total Spent</span>
            <TrendingDown style={{color: '#f43f5e'}} size={24} />
          </div>
          <p className="stat-value">${budget.spent.toFixed(2)}</p>
        </div>

        <div className="stat-card emerald">
          <div className="stat-header">
            <span className="stat-title">Remaining</span>
            <TrendingUp style={{color: '#10b981'}} size={24} />
          </div>
          <p className="stat-value">${budget.remaining.toFixed(2)}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-4">
          <h3>Budget Progress</h3>
          <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
            {progressPercent.toFixed(1)}% used
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${progressClass}`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="flex-center mb-6">
          <PieChart size={20} />
          Spending by Category
        </h3>
        <div>
          {CATEGORY_ORDER.map((category) => {
            const amount = Number(combinedTotals[category] || 0);
            const Icon = CATEGORY_ICONS[category] || CreditCard;
            const pct = budget.spent > 0 ? (amount / budget.spent) * 100 : 0;
            return (
              <div key={category} className="category-item">
                <div className="category-header">
                  <span className="category-name">
                    <Icon size={18} style={{color: '#4f46e5'}} />
                    {category}
                  </span>
                  <span className="category-amount">${amount.toFixed(2)}</span>
                </div>
                <div className="category-bar">
                  <div className="category-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="flex-center mb-6">Saved Schools</h3>
        {hasSchool ? (
          <div className="tab">
            <h2>{school.name} - {school.state}</h2>
            <h4 className="category-name">City: <p>{school.city}</p></h4>
            <h4 className="category-name">Tuition: <p>{school.tution}</p></h4>
            <h4 className="category-name">Rent: <p>${school.rent}</p></h4>
            <h3>Your Personalized Cost : $8,589</h3>
          </div>
        ) : (
          <p>No saved school</p>
        )}
      </div>
    </div>
  );
}
