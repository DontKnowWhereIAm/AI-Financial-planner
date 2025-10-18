import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, PieChart, Upload } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="container">
        <div className="landing-header">
          <div>
            <h1>AstraFin</h1>
            <p>Track your spending and stay on budget</p>
          </div>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Login
          </button>
        </div>

        <div className="hero-section">
          <h2>Take Control of Your Student Budget</h2>
          <p>
            Managing money as a student shouldn't be stressful. Our simple, powerful tools help you track spending, 
            stick to your budget, and make smarter financial decisions.
          </p>
          <button onClick={() => navigate('/login')} className="btn" style={{backgroundColor: 'white', color: '#4f46e5'}}>
            Get Started →
          </button>
        </div>

        <div className="grid grid-cols-3 mb-8">
          <div className="feature-card">
            <div className="feature-icon indigo">
              <DollarSign className="text-indigo-600" size={32} style={{color: '#4f46e5'}} />
            </div>
            <h3 className="mb-2">Budget Tracking</h3>
            <p>
              Set monthly budgets and watch your spending in real-time. Visual progress bars show exactly 
              where you stand at a glance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <PieChart size={32} style={{color: '#7c3aed'}} />
            </div>
            <h3 className="mb-2">Spending Insights</h3>
            <p>
              See exactly where your money goes with category breakdowns. Understand your habits and 
              identify areas to save.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon emerald">
              <Upload size={32} style={{color: '#10b981'}} />
            </div>
            <h3 className="mb-2">Bank Statement Import</h3>
            <p>
              Upload your bank statements and let us automatically categorize and track your transactions 
              for you.
            </p>
          </div>
        </div>

        <div className="how-it-works">
          <h3 className="text-center mb-8">How It Works</h3>
          <div className="grid grid-cols-3">
            <div className="text-center">
              <div className="step-number indigo">1</div>
              <h4 className="mb-2">Set Your Budget</h4>
              <p>Start by setting a monthly budget that works for your student lifestyle.</p>
            </div>
            <div className="text-center">
              <div className="step-number purple">2</div>
              <h4 className="mb-2">Log Your Expenses</h4>
              <p>Quickly add expenses manually or upload your bank statements.</p>
            </div>
            <div className="text-center">
              <div className="step-number emerald">3</div>
              <h4 className="mb-2">Stay on Track</h4>
              <p>Monitor your progress and adjust your spending to meet your financial goals.</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h3>Ready to Master Your Money?</h3>
          <p>Join thousands of students who are taking control of their finances.</p>
          <button onClick={() => navigate('/login')} className="btn" style={{backgroundColor: 'white', color: '#10b981'}}>
            Start Tracking Now
          </button>
        </div>
      </div>
    </div>
  );
}