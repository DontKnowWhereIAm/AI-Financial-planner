import React from 'react';
import {Stethoscope,Hospital, Coins, University, DollarSign, TrendingUp, TrendingDown, PieChart, BookOpen, Home, Utensils, ShoppingBag, CreditCard } from 'lucide-react';
import './Overview.css';
import savedSchool from "./savedSchools.json";

export default function Overview({ expenses }) {
const categoryTotals = {
  Education: 400,
  Books: 100,
  Housing: 800,
  Healthcare: 300,
  Insurance: 200,
  Savings: 250,
  Entertainment: 150,
  Food: 350,
  Other: 100
};

  const categoryIcons = {
    Education : University,
    Books: BookOpen,
    Housing: Home,
    Healthcare : Hospital,
    Insurance : Stethoscope,
    Savings : Coins,
    Entertainment: ShoppingBag,
    Food: Utensils,
      Other: CreditCard
  };
const budget = {
    total: 3000,
    spent: Object.entries(categoryTotals).reduce(
  (sum, [category, amount]) => sum + amount,
  0)
  };
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
      <div className="card">
  <h3 className="flex-center mb-6">Saved Schools</h3>

  {Array.isArray(savedSchool) && savedSchool.length > 0 ? (
    savedSchool.map((item, index) => (
      <div key={item.name ? item.name + index : index} className="saved-school">
        <p>
          <strong>Name:</strong> {item.name} {item.state ? `(${item.state})` : ""}
        </p>
        <p>
          <strong>City:</strong> {item.city || "N/A"}
        </p>
        <p>
          <strong>Tuition:</strong> {item.tuition ?? item.tution ?? "N/A"}
        </p>
        <p>
          <strong>Rent:</strong> {item.rent ?? "N/A"}
        </p>
        <p>
          <strong>Dorm:</strong> {item.dorm ?? "N/A"}
        </p>
      </div>
    ))
  ) : (
    <p style={{ color: "#6b7280" }}>No saved schools yet.</p>
  )}
</div>
    </div>
  );
}