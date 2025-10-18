import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Food', amount: 45.50, date: '2025-10-15', description: 'Grocery shopping' },
    { id: 2, category: 'Books', amount: 120.00, date: '2025-10-14', description: 'Textbooks' },
    { id: 3, category: 'Housing', amount: 800.00, date: '2025-10-01', description: 'Rent' },
    { id: 4, category: 'Entertainment', amount: 25.00, date: '2025-10-12', description: 'Movie tickets' },
  ]);

  const handleLogin = (email, password) => {
    if (email && password) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const addExpense = (newExpense) => {
    setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          isLoggedIn ? (
            <Dashboard 
              expenses={expenses} 
              onLogout={handleLogout}
              onAddExpense={addExpense}
            />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;