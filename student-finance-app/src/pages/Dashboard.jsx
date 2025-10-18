import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Overview from '../components/Overview';
import Expenses from '../components/Expenses';
import UploadStatements from '../components/UploadStatements';
import './Dashboard.css';

export default function Dashboard({ expenses, onLogout, onAddExpense }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const universalName = window.ASTRA_USER_NAME || 'Julia';

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>AstraFin</h1>
            <p>Welcome back {universalName}! Here's your financial overview</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
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