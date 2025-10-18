import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BookOpen, Home, Utensils, ShoppingBag, CreditCard } from 'lucide-react';
import './Overview.css';

export default function Overview({ expenses }) {
  const budget = {
    total: 2000,
    spent: expenses.reduce((sum, exp) => sum + exp.amount, 0)
  };

  const categoryIcons = {
    Food: Utensils,
    Books: BookOpen,
    Housing: Home,
    Entertainment: ShoppingBag,
    Other: CreditCard
  };

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const progressPercent = (budget.spent / budget.total) * 100;
  let progressClass = 'green';
  if (progressPercent > 90) progressClass = 'red';
  else if (progressPercent > 70) progressClass = 'yellow';

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
          <p className="stat-value">${(budget.total - budget.spent).toFixed(2)}</p>
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
          {Object.entries(categoryTotals).map(([category, amount]) => {
            const Icon = categoryIcons[category] || CreditCard;
            const percentage = (amount / budget.spent) * 100;
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
                  <div className="category-fill" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}