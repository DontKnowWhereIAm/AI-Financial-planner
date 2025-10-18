import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Home, Utensils, ShoppingBag, CreditCard } from 'lucide-react';

export default function Expenses({ expenses, onAddExpense }) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'Food',
    amount: '',
    date: '',
    description: ''
  });

  const categoryIcons = {
    Food: Utensils,
    Books: BookOpen,
    Housing: Home,
    Entertainment: ShoppingBag,
    Other: CreditCard
  };

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.date && newExpense.description) {
      onAddExpense({
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        description: newExpense.description
      });
      setNewExpense({ category: 'Food', amount: '', date: '', description: '' });
      setShowAddExpense(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Recent Expenses</h2>
        <button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {showAddExpense && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option>Food</option>
                <option>Books</option>
                <option>Housing</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="What did you buy?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddExpense}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Save Expense
            </button>
            <button
              onClick={() => setShowAddExpense(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => {
            const Icon = categoryIcons[expense.category] || CreditCard;
            return (
              <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Icon className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{expense.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">{expense.category}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">${expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}