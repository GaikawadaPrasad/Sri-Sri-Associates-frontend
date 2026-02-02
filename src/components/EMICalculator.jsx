import React, { useState } from 'react';
import { Calculator, IndianRupee } from 'lucide-react';
// import toast from 'react-hot-toast';

const EMICalculator = () => {
  const [p, setP] = useState(100000); // Principal
  const [r, setR] = useState(10.5);   // Interest Rate
  const [n, setN] = useState(12);     // Tenure in months

  const calculateEMI = () => {
    const monthlyRate = r / 12 / 100;
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return Math.round(emi) || 0;
    
  };

  const totalInterest = (calculateEMI() * n) - p;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calculator className="text-blue-600" size={20} /> EMI Calculator
      </h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-gray-600">Loan Amount</label>
            <span className="text-blue-600 font-bold">₹{p.toLocaleString()}</span>
          </div>
          <input type="range" min="10000" max="5000000" step="10000" value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-gray-600">Interest Rate (p.a)</label>
            <span className="text-blue-600 font-bold">{r}%</span>
          </div>
          <input type="range" min="5" max="25" step="0.1" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-gray-600">Tenure (Months)</label>
            <span className="text-blue-600 font-bold">{n}m</span>
          </div>
          <input type="range" min="6" max="120" step="6" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>

        <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center mt-4">
          <div>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Monthly EMI</p>
            <p className="text-2xl font-black text-blue-900">₹{calculateEMI().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Total Interest</p>
            <p className="text-sm font-bold text-gray-700">₹{totalInterest.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;