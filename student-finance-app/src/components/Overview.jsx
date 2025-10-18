import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BookOpen, Home, Utensils, ShoppingBag, CreditCard } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Monthly Budget</h3>
            <DollarSign className="text-indigo-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">${budget.total.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-rose-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Total Spent</h3>
            <TrendingDown className="text-rose-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">${budget.spent.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Remaining</h3>
            <TrendingUp className="text-emerald-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">${(budget.total - budget.spent).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Budget Progress</h3>
          <span className="text-sm text-gray-600">
            {((budget.spent / budget.total) * 100).toFixed(1)}% used
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              (budget.spent / budget.total) > 0.9 ? 'bg-rose-500' : 
              (budget.spent / budget.total) > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min((budget.spent / budget.total) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PieChart size={20} />
          Spending by Category
        </h3>
        <div className="space-y-4">
          {Object.entries(categoryTotals).map(([category, amount]) => {
            const Icon = categoryIcons[category] || CreditCard;
            const percentage = (amount / budget.spent) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-indigo-600" />
                    <span className="font-medium text-gray-700">{category}</span>
                  </div>
                  <span className="font-semibold text-gray-800">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}