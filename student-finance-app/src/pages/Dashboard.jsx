import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Overview from '../components/Overview';
import Expenses from '../components/Expenses';
import UploadStatements from '../components/UploadStatements';

export default function Dashboard({ expenses, onLogout, onAddExpense }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Finance Hub</h1>
            <p className="text-gray-600">Welcome back! Here's your financial overview</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'expenses'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Upload Statements
          </button>
        </div>

        {activeTab === 'overview' && <Overview expenses={expenses} />}
        {activeTab === 'expenses' && <Expenses expenses={expenses} onAddExpense={onAddExpense} />}
        {activeTab === 'upload' && <UploadStatements />}
      </div>
    </div>
  );
}