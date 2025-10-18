import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, PieChart, Upload } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Finance Hub</h1>
            <p className="text-gray-600">Track your spending and stay on budget</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg"
          >
            Login
          </button>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white">
            <h2 className="text-5xl font-bold mb-4">Take Control of Your Student Budget</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl">
              Managing money as a student shouldn't be stressful. Our simple, powerful tools help you track spending, 
              stick to your budget, and make smarter financial decisions.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
            >
              Get Started →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Budget Tracking</h3>
              <p className="text-gray-600">
                Set monthly budgets and watch your spending in real-time. Visual progress bars show exactly 
                where you stand at a glance.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Spending Insights</h3>
              <p className="text-gray-600">
                See exactly where your money goes with category breakdowns. Understand your habits and 
                identify areas to save.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-emerald-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Upload className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Bank Statement Import</h3>
              <p className="text-gray-600">
                Upload your bank statements and let us automatically categorize and track your transactions 
                for you.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-10">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Set Your Budget</h4>
                <p className="text-gray-600">
                  Start by setting a monthly budget that works for your student lifestyle.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Log Your Expenses</h4>
                <p className="text-gray-600">
                  Quickly add expenses manually or upload your bank statements.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Stay on Track</h4>
                <p className="text-gray-600">
                  Monitor your progress and adjust your spending to meet your financial goals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-10 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Master Your Money?</h3>
            <p className="text-xl text-emerald-50 mb-6">
              Join thousands of students who are taking control of their finances.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg"
            >
              Start Tracking Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}