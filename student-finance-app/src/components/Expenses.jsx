import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Home, Utensils, ShoppingBag, CreditCard } from 'lucide-react';
import './Expenses.css';

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
    <div>
      <div className="expenses-header">
        <h2>Recent Expenses</h2>
        <button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {showAddExpense && (
        <div className="expense-form">
          <h3 className="mb-4">New Expense</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="label">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="input"
              >
                <option>Food</option>
                <option>Books</option>
                <option>Housing</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Amount</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="What did you buy?"
                className="input"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAddExpense} className="btn btn-primary">
              Save Expense
            </button>
            <button
              onClick={() => setShowAddExpense(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="expense-list">
        {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => {
          const Icon = categoryIcons[expense.category] || CreditCard;
          return (
            <div key={expense.id} className="expense-item">
              <div className="expense-details">
                <div className="expense-icon">
                  <Icon style={{color: '#4f46e5'}} size={24} />
                </div>
                <div className="expense-info">
                  <h4>{expense.description}</h4>
                  <div className="expense-meta">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span className="flex-center">
                      <Calendar size={14} />
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="expense-amount">
                ${expense.amount.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}