import React, { useState, useMemo } from "react";
import { Calculator, Calendar, ChevronDown, ChevronUp, BarChart2, Info } from "lucide-react";

const fmt = (n) => "₹" + Math.round(Math.max(0, n)).toLocaleString("en-IN");

// ── Donut Chart with Legend ──────────────────────────────────────────────────
const DonutChart = ({ principal, interest }) => {
  const total = principal + interest;
  if (total <= 0) return null;
  const r = 58, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const pFrac = principal / total;
  const pDash = pFrac * circ;
  const iDash = circ - pDash;
  const gap = 3;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 140 140" className="w-32 h-32">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3a6e" strokeWidth="18" />
        {/* Interest arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444"
          strokeWidth="18"
          strokeDasharray={`${Math.max(0, iDash - gap)} ${circ}`}
          strokeDashoffset={-(pDash - gap / 2)}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        {/* Principal arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#60A5FA"
          strokeWidth="18"
          strokeDasharray={`${Math.max(0, pDash - gap)} ${circ}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="7.5" fill="white" fontWeight="700" letterSpacing="0.5">TOTAL</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="white" fontWeight="800">
          ₹{total >= 100000 ? (total / 100000).toFixed(1) + "L" : (total / 1000).toFixed(0) + "K"}
        </text>
      </svg>
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Principal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Interest</span>
        </div>
      </div>
    </div>
  );
};

// ── Slider — CSS gradient track, no absolute overflow ───────────────────────
const Slider = ({ label, value, min, max, step, onChange, display, color = "#3B82F6", rightSlot }) => {
  const pct = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const trackStyle = {
    WebkitAppearance: "none",
    appearance: "none",
    width: "100%",
    height: "6px",
    borderRadius: "999px",
    outline: "none",
    cursor: "pointer",
    background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightSlot}
          <span className="text-xs font-black px-2.5 py-1 rounded-lg" style={{ background: color + "18", color }}>{display}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={trackStyle}
      />
      <div className="flex justify-between text-[10px] text-gray-300 font-bold mt-1">
        <span>{min >= 100000 ? `₹${(min / 100000).toFixed(0)}L` : min >= 1000 ? `₹${(min / 1000).toFixed(0)}K` : min}</span>
        <span>{max >= 100000 ? `₹${(max / 100000).toFixed(0)}L` : max >= 1000 ? `₹${(max / 1000).toFixed(0)}K` : max}</span>
      </div>
    </div>
  );
};

// ── Loan presets ─────────────────────────────────────────────────────────────
const PRESETS = {
  "Home Loan":     { rate: 8.5,  minP: 0, maxP: 10000000, maxTenureM: 240, step: 50000 },
  "Personal Loan": { rate: 14.0, minP: 0, maxP: 2000000,  maxTenureM: 60,  step: 10000 },
  "Car Loan":      { rate: 9.0,  minP: 0, maxP: 3000000,  maxTenureM: 84,  step: 25000 },
  "Business Loan": { rate: 16.0, minP: 0, maxP: 5000000,  maxTenureM: 60,  step: 50000 },
  "Gold Loan":     { rate: 11.0, minP: 0, maxP: 1000000,  maxTenureM: 24,  step: 5000  },
};

// ── Main ─────────────────────────────────────────────────────────────────────
const EMICalculator = ({ adminMode = false }) => {
  const [loanType, setLoanType]       = useState("Home Loan");
  const [principal, setPrincipal]     = useState(500000);
  const [rate, setRate]               = useState(8.5);
  const [tenureM, setTenureM]         = useState(120); // always stored in months internally
  const [tenureUnit, setTenureUnit]   = useState("months");
  const [showAmort, setShowAmort]     = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [cRate, setCRate]             = useState(12);
  const [cTenureM, setCTenureM]       = useState(48);

  const preset = PRESETS[loanType];

  // Tenure slider display values
  const sliderTenureValue = tenureUnit === "years" ? Math.round(tenureM / 12) : tenureM;
  const sliderTenureMin   = tenureUnit === "years" ? 0 : 0;
  const sliderTenureMax   = tenureUnit === "years"
    ? Math.floor(preset.maxTenureM / 12)
    : preset.maxTenureM;
  const sliderTenureStep  = tenureUnit === "years" ? 1 : 6;

  const handleTenureSlider = (val) => {
    setTenureM(tenureUnit === "years" ? val * 12 : val);
  };

  const handleTenureUnit = (unit) => {
    if (unit === tenureUnit) return;
    // Convert: months→years = round to nearest year; years→months = keep
    if (unit === "years") setTenureM(Math.max(12, Math.round(tenureM / 12) * 12));
    setTenureUnit(unit);
  };

  const handlePreset = (type) => {
    setLoanType(type);
    setRate(PRESETS[type].rate);
    const newMax = PRESETS[type].maxTenureM;
    if (tenureM > newMax) setTenureM(newMax);
  };

  // EMI math
  const n  = Math.max(1, tenureM);
  const r  = rate / 12 / 100;
  const emi = useMemo(() => {
    if (r === 0 || n === 0) return principal / Math.max(1, n);
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [principal, r, n]);

  const totalPayable  = emi * n;
  const totalInterest = Math.max(0, totalPayable - principal);
  const interestPct   = totalPayable > 0 ? ((totalInterest / totalPayable) * 100).toFixed(1) : 0;

  // Compare EMI
  const cr   = cRate / 12 / 100;
  const cN   = Math.max(1, cTenureM);
  const cEmi = useMemo(() => {
    if (cr === 0) return principal / cN;
    return (principal * cr * Math.pow(1 + cr, cN)) / (Math.pow(1 + cr, cN) - 1);
  }, [principal, cr, cN]);
  const cTotal    = cEmi * cN;
  const cInterest = Math.max(0, cTotal - principal);

  // Amortization
  const amort = useMemo(() => {
    let bal = principal;
    const rows = [];
    for (let m = 1; m <= n; m++) {
      const ip = bal * r;
      const pp = emi - ip;
      bal = Math.max(0, bal - pp);
      const y = Math.ceil(m / 12);
      if (!rows[y - 1]) rows[y - 1] = { year: y, principal: 0, interest: 0, balance: 0 };
      rows[y - 1].principal += pp;
      rows[y - 1].interest  += ip;
      rows[y - 1].balance    = bal;
    }
    return rows;
  }, [principal, r, emi, n]);

  // Tenure Mo/Yr toggle pill
  const TenureToggle = (
    <div className="flex items-center bg-blue-50 rounded-lg p-0.5 flex-shrink-0">
      {["months", "years"].map((u) => (
        <button key={u}
          onClick={() => handleTenureUnit(u)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${
            tenureUnit === u ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >{u === "months" ? "Mo" : "Yr"}</button>
      ))}
    </div>
  );

  return (
    <div className={`font-sans ${adminMode ? "" : "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-4 md:p-8"}`}>
      <div className={adminMode ? "" : "max-w-5xl mx-auto"}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">EMI Calculator</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sri Sri Associates</p>
            </div>
          </div>
          <button onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
              compareMode
                ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100"
                : "bg-white border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
            }`}>
            <BarChart2 size={14} /> Compare Loans
          </button>
        </div>

        {/* ── Loan Type Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
          {Object.keys(PRESETS).map((type) => (
            <button key={type} onClick={() => handlePreset(type)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${
                loanType === type
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white border-gray-200 text-gray-500 hover:border-blue-300"
              }`}>
              {type}
            </button>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className={`grid ${compareMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>

          {/* ── Loan A ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            {compareMode && (
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Loan A</span>
              </div>
            )}

            <div className="space-y-6">
              <Slider label="Loan Amount" value={principal}
                min={preset.minP} max={preset.maxP} step={preset.step}
                onChange={setPrincipal}
                display={principal >= 100000 ? `₹${(principal / 100000).toFixed(2)}L` : `₹${(principal / 1000).toFixed(0)}K`}
                color="#3B82F6"
              />

              <Slider label="Interest Rate (p.a.)" value={rate}
                min={0} max={25} step={0.25}
                onChange={setRate}
                display={`${rate}%`}
                color="#8B5CF6"
              />

              <Slider label="Loan Tenure" value={sliderTenureValue}
                min={sliderTenureMin} max={sliderTenureMax} step={sliderTenureStep}
                onChange={handleTenureSlider}
                display={tenureUnit === "years" ? `${sliderTenureValue} Yr` : `${sliderTenureValue} Mo`}
                color="#10B981"
                rightSlot={TenureToggle}
              />
            </div>

            {/* Result card */}
            <div className="mt-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Monthly EMI</p>
                  <p className="text-3xl font-black">{fmt(emi)}</p>
                  <p className="text-[10px] text-blue-200 mt-1 font-bold">for {n} months</p>
                </div>
                <DonutChart principal={principal} interest={totalInterest} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase text-blue-200">Principal</p>
                  <p className="text-xs font-black mt-1">{fmt(principal)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase text-blue-200">Interest</p>
                  <p className="text-xs font-black mt-1 text-red-300">{fmt(totalInterest)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase text-blue-200">Total Pay</p>
                  <p className="text-xs font-black mt-1">{fmt(totalPayable)}</p>
                </div>
              </div>

              <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                <Info size={11} className="text-blue-200 flex-shrink-0" />
                <p className="text-[10px] font-bold text-blue-100">Interest = {interestPct}% of total repayment</p>
              </div>
            </div>
          </div>

          {/* ── Loan B (Compare) ── */}
          {compareMode && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Loan B — Compare</span>
              </div>

              <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-6 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">Same Principal</span>
                <span className="text-sm font-black text-slate-800">{fmt(principal)}</span>
              </div>

              <div className="space-y-6">
                <Slider label="Interest Rate (p.a.)" value={cRate}
                  min={0} max={25} step={0.25}
                  onChange={setCRate}
                  display={`${cRate}%`}
                  color="#8B5CF6"
                />
                <Slider label="Tenure (Months)" value={cTenureM}
                  min={0} max={240} step={6}
                  onChange={setCTenureM}
                  display={`${cTenureM} Mo`}
                  color="#10B981"
                />
              </div>

              <div className="mt-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Monthly EMI</p>
                    <p className="text-3xl font-black">{fmt(cEmi)}</p>
                    <p className="text-[10px] text-purple-200 mt-1 font-bold">for {cN} months</p>
                  </div>
                  <DonutChart principal={principal} interest={cInterest} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase text-purple-200">Principal</p>
                    <p className="text-xs font-black mt-1">{fmt(principal)}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase text-purple-200">Interest</p>
                    <p className="text-xs font-black mt-1 text-red-300">{fmt(cInterest)}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase text-purple-200">Total Pay</p>
                    <p className="text-xs font-black mt-1">{fmt(cTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Delta summary */}
              <div className={`mt-4 rounded-2xl p-4 border-2 ${cEmi <= emi ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">Difference vs Loan A</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Monthly EMI", delta: cEmi - emi },
                    { label: "Total Interest", delta: cInterest - totalInterest },
                    { label: "Total Payable", delta: cTotal - totalPayable },
                  ].map(({ label, delta }) => (
                    <div key={label}>
                      <p className="text-[10px] text-gray-400 font-bold">{label}</p>
                      <p className={`text-sm font-black mt-0.5 ${delta <= 0 ? "text-green-600" : "text-red-600"}`}>
                        {delta <= 0 ? "−" : "+"}{fmt(Math.abs(delta))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Amortization ── */}
        <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <button onClick={() => setShowAmort(!showAmort)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Calendar size={17} className="text-blue-600" />
              <span className="text-sm font-black text-slate-800">Yearly Amortization Schedule</span>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{amort.length} years</span>
            </div>
            {showAmort ? <ChevronUp size={17} className="text-gray-400" /> : <ChevronDown size={17} className="text-gray-400" />}
          </button>

          {showAmort && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    {["Year", "Principal Paid", "Interest Paid", "Total Paid", "Balance"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-black uppercase text-gray-400 tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {amort.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Year {row.year}</span>
                      </td>
                      <td className="px-5 py-3 text-xs font-bold text-emerald-600">{fmt(row.principal)}</td>
                      <td className="px-5 py-3 text-xs font-bold text-red-500">{fmt(row.interest)}</td>
                      <td className="px-5 py-3 text-xs font-bold text-slate-700">{fmt(row.principal + row.interest)}</td>
                      <td className="px-5 py-3 text-xs font-bold text-slate-400">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-300 font-bold mt-4 pb-2">
          * Indicative only. Actual EMI may vary based on lender terms.
        </p>
      </div>
    </div>
  );
};

export default EMICalculator;
