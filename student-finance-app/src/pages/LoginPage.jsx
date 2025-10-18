import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin(email, password)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="text-center mb-8">
          <h1>Welcome Back!</h1>
          <p>Login to access your financial dashboard</p>
        </div>

        <div className="login-card">
          <div className="login-form">
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>
            <button onClick={handleSubmit} className="btn btn-primary" style={{width: '100%'}}>
              Login
            </button>
          </div>

          <div className="text-center mt-6">
            <button onClick={() => navigate('/')} className="back-link">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}