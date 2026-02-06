import React, { useContext, useEffect, useState, useCallback } from "react";
import API from "../../api/axiosInstance";
import LeadHistory from "../../components/LeadHistory";
import EMICalculator from "../../components/EMICalculator";
import ApplicationDetail from "../../components/ApplicationDetail";
import {
  Plus,
  Calculator,
  FileText,
  CheckCircle,
  Clock,
  ArrowLeft,
  Upload,
  AlertCircle,
  History,
  LayoutGrid,
  Target,
  RefreshCcw,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeView, setActiveView] = useState("dashboard");
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    disbursed: 0,
    pending: 0,
    unfinished: 0,
  });
  const [targetProgress, setTargetProgress] = useState({
    completedAmount: 0,
    remainingAmount: 0,
    targetAmount: 0,
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanType, setLoanType] = useState("");
  const [formData, setFormData] = useState({});

  // --- DATA FETCHING ---
  const fetchDashboardData = useCallback(async () => {
    try {
      const { data } = await API.get("/leads/my-leads");
      const all = data.data;
      setLeads(all);
      setStats({
        total: all.length,
        disbursed: all.filter((l) => l.status === "Disbursed").length,
        pending: all.filter((l) => l.isFinished && l.status !== "Disbursed").length,
        unfinished: all.filter((l) => !l.isFinished).length,
      });
    } catch (err) {
      toast.error("Error loading leads");
    }
  }, []);

  const fetchTargetData = useCallback(async () => {
    try {
      const { data } = await API.get("/targets/progress", {
        params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      });
      setTargetProgress(data);
    } catch (err) {
      console.log("Target not set yet");
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchTargetData();
  }, [fetchDashboardData, fetchTargetData]);

  // --- HANDLERS ---
  const handleEditInit = (lead) => {
    setLoanType(lead.loanType);
    setFormData({
      id: lead._id,
      customerName: lead.customerName,
      mobileNumber: lead.mobileNumber,
      loanAmount: lead.loanAmount,
      ...lead.loanDetails, 
    });
    setActiveView("edit");
  };

  // const handleAction = async (e) => {
  //   e.preventDefault();
  //   if (!loanType) return toast.error("Please select a loan type first");
  //   setIsSubmitting(true);
  //   const loadingToast = toast.loading(activeView === "add" ? "Creating Application..." : "Saving Changes...");
    
  //   try {
  //     const data = new FormData();
  //     const { id, customerName, mobileNumber, loanAmount, newFile, ...loanDetails } = formData;
      
  //     data.append("customerName", customerName);
  //     data.append("mobileNumber", mobileNumber);
  //     data.append("loanAmount", loanAmount);
  //     data.append("loanType", loanType);
      
  //     if (newFile) data.append("documents", newFile);

  //     Object.keys(loanDetails).forEach((key) => {
  //       if (loanDetails[key] !== undefined && loanDetails[key] !== null) {
  //         data.append(key, loanDetails[key]);
  //       }
  //     });

  //     if (activeView === "add") {
  //       await API.post("/leads/create", data, { headers: { "Content-Type": "multipart/form-data" } });
  //       toast.success("Lead Created Successfully!", { id: loadingToast });
  //     } else {
  //       await API.put(`/leads/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
  //       toast.success("Application Updated Successfully!", { id: loadingToast });
  //     }
      
  //     fetchDashboardData();
  //     fetchTargetData();
  //     setActiveView("dashboard");
  //     setFormData({});
  //     setLoanType("");
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Operation failed", { id: loadingToast });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


  const handleAction = async (e) => {
  e.preventDefault();
  if (!loanType) return toast.error("Please select a loan type first");
  
  setIsSubmitting(true);
  const loadingToast = toast.loading(activeView === "add" ? "Creating Application..." : "Saving Changes...");
    
  

  try {
    const data = new FormData();
    // Destructure everything except the file and the ID
    const { id, newFile, ...restOfFields } = formData;
    
    // 1. Append basic fields
    data.append("loanType", loanType);
    
    // 2. Append all text fields from the rest of the object
    Object.keys(restOfFields).forEach((key) => {
      if (restOfFields[key] !== undefined && restOfFields[key] !== null) {
        data.append(key, restOfFields[key]);
      }
    });

    // 3. CRITICAL: Append the file only if it exists
    if (newFile) {
      data.append("documents", newFile); // Ensure the key matches your backend (req.files)
    }

    if (activeView === "add") {
      await API.post("/leads/create", data, { 
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000 // Give Cloudinary 30 seconds to process
      });
      toast.success("Lead Created Successfully!", { id: loadingToast });
    } else {
      await API.put(`/leads/${id}`, data, { 
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000
      });
      toast.success("Application Updated Successfully!", { id: loadingToast });
    }
    
    // Reset states after success
    await fetchDashboardData();
    setActiveView("dashboard");
    setFormData({});
    setLoanType("");
  } catch (err) {
    console.error("Submission Error:", err);
    toast.error(err.response?.data?.message || "Connection timeout. Check file size.", { id: loadingToast });
  } finally {
    setIsSubmitting(false); // This ensures the button is never stuck
  }
};
  return (
    <div className="bg-[#F8FAFF] min-h-screen pb-32 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
          <div>
            <h1 className="text-3xl font-black text-[#0A1D37] tracking-tight uppercase">
              Welcome, {user?.name?.split(' ')[0] || "Partner"}
            </h1>
            <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
              Sri Sri Associates • Agent Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <Clock className="text-blue-600" size={18} />
              <span className="text-xs font-black text-slate-700 uppercase">
                {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
            </div>
            <button
              onClick={() => { setLoanType(""); setFormData({}); setActiveView("add"); }}
              className="flex items-center gap-2 bg-[#050C25] text-white px-6 py-3 rounded-2xl shadow-lg font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              <Plus size={18} /> New Lead
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          <StatCard label="Incomplete" value={stats.unfinished} icon={<AlertCircle />} color="blue" onClick={() => setActiveView("unfinished")} />
          <StatCard label="Disbursed" value={stats.disbursed} icon={<CheckCircle />} color="green" onClick={() => setActiveView("disbursed")} />
          <StatCard label="Total Target" value={`₹${targetProgress.targetAmount?.toLocaleString()}`} icon={<Target />} color="indigo" onClick={() => setActiveView("target")} />
        </div>

        {/* Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <MiniCard label="Total Leads" count={stats.total} icon={<FileText size={18} className="text-blue-500" />} onClick={() => setActiveView("all-leads")} />
          <MiniCard label="Fix Missing" count={stats.unfinished} icon={<History size={18} className="text-orange-500" />} onClick={() => setActiveView("unfinished")} />
          <MiniCard label="In Review" count={stats.pending} icon={<Clock size={18} className="text-teal-500" />} onClick={() => setActiveView("pending")} />
          <MiniCard label="Success" count={stats.disbursed} icon={<Calculator size={18} className="text-blue-400" />} onClick={() => setActiveView("disbursed")} />
        </div>

        {/* Dynamic Content Area */}
        {activeView === "dashboard" ? (
          <div className="mt-10 space-y-8">
             {/* Target Progress Bar */}
             {targetProgress.targetAmount > 0 && (
                <div className="bg-[#0A1D37] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="flex justify-between items-end mb-4">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300">Monthly Performance</h3>
                         <span className="text-2xl font-black italic">{Math.round((targetProgress.completedAmount / targetProgress.targetAmount) * 100)}%</span>
                      </div>
                      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                         <div 
                           className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000" 
                           style={{ width: `${Math.min((targetProgress.completedAmount / targetProgress.targetAmount) * 100, 100)}%` }}
                         />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                         <span>Achieved: ₹{targetProgress.completedAmount?.toLocaleString()}</span>
                         <span>Goal: ₹{targetProgress.targetAmount?.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
             )}

             {/* Tools Grid */}
             <div className="space-y-4">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span> Quick Services
                </h3>
                <div className="bg-white border border-gray-100 rounded-[32px] p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 shadow-sm">
                  <ToolItem icon={<AlertCircle />} label="Fix Missing" onClick={() => setActiveView("unfinished")} />
                  <ToolItem icon={<Calculator />} label="EMI Calc" onClick={() => setActiveView("emi")} />
                  <ToolItem icon={<History />} label="Lead History" onClick={() => setActiveView("all-leads")} />
                  <ToolItem icon={<RefreshCcw />} label="Sync Data" onClick={() => { fetchDashboardData(); fetchTargetData(); }} />
                </div>
             </div>

             {/* Recent Leads Preview */}
             <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Recent Applications</h3>
                   <button onClick={() => setActiveView("all-leads")} className="text-[10px] font-black text-blue-600 uppercase">View All</button>
                </div>
                <LeadHistory leads={leads.slice(0, 5)} onLeadClick={setSelectedLead} onEditClick={handleEditInit} />
             </div>
          </div>
        ) : (
          <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setActiveView("dashboard")} 
              className="flex items-center gap-2 text-gray-400 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Overview</span>
            </button>

            {activeView === "emi" && <EMICalculator />}

            {["all-leads", "unfinished", "pending", "disbursed"].includes(activeView) && (
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xl">
                <LeadHistory
                  leads={
                    activeView === "unfinished" ? leads.filter((l) => !l.isFinished)
                    : activeView === "pending" ? leads.filter((l) => l.isFinished && l.status !== "Disbursed")
                    : activeView === "disbursed" ? leads.filter((l) => l.status === "Disbursed")
                    : leads
                  }
                  onLeadClick={setSelectedLead}
                  onEditClick={handleEditInit}
                />
              </div>
            )}

            {(activeView === "add" || activeView === "edit") && (
              <form onSubmit={handleAction} className="bg-white p-8 rounded-[40px] border border-gray-100 space-y-6 max-w-2xl mx-auto shadow-2xl mb-20">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {activeView === "add" ? "New Application" : "Update Application"}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Please ensure all details are accurate</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Loan Type</label>
                  <select
                    disabled={activeView === "edit"}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xs uppercase appearance-none"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                  >
                    <option value="">-- Choose Loan Category --</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="LAP Loan">LAP Loan</option>
                    <option value="Vehicle Loan">Vehicle Loan</option>
                  </select>
                </div>

                {loanType && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Customer Name" required value={formData.customerName || ""} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
                      <InputField label="Mobile Number" required value={formData.mobileNumber || ""} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} />
                      <InputField label="Required Amount" type="number" required value={formData.loanAmount || ""} onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })} />
                      <InputField label="Document ID (PAN/Aadhar)" value={formData.docType || ""} onChange={(e) => setFormData({ ...formData, docType: e.target.value })} />
                    </div>

                    {/* DYNAMIC FIELDS */}
                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(loanType === "Home Loan" || loanType === "LAP Loan") && (
                        <>
                          <InputField label="Total Sq. Ft" type="number" value={formData.sqFt || ""} onChange={(e) => setFormData({ ...formData, sqFt: e.target.value })} />
                          <InputField label="Property Area" value={formData.area || ""} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
                          <InputField label="Estimated Market Value" value={formData.houseValue || ""} onChange={(e) => setFormData({ ...formData, houseValue: e.target.value })} />
                        </>
                      )}

                      {(loanType === "Personal Loan" || loanType === "Business Loan") && (
                        <>
                          <InputField label="Monthly/Annual Income" type="number" value={formData.income || ""} onChange={(e) => setFormData({ ...formData, income: e.target.value })} />
                          <InputField label="Residence Status" value={formData.residence || ""} onChange={(e) => setFormData({ ...formData, residence: e.target.value })} />
                        </>
                      )}

                      {loanType === "Business Loan" && (
                        <>
                          <RadioGroup label="ITR / GST Available?" name="itr_gst" value={formData.itr_gst} onChange={(val) => setFormData({...formData, itr_gst: val})} />
                          <RadioGroup label="Labour License?" name="labourLic" value={formData.labourLic} onChange={(val) => setFormData({...formData, labourLic: val})} />
                        </>
                      )}

                      {loanType === "Vehicle Loan" && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Vehicle Type</label>
                            <select className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase" value={formData.vehicleType || ""} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}>
                              <option value="">-- Select --</option>
                              <option value="Car">Car</option>
                              <option value="Bike">Bike</option>
                              <option value="Tractor">Tractor</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <InputField label="Brand/Model" value={formData.vehicleModel || ""} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} />
                          <InputField label="Vehicle Number" value={formData.vehicleNumber || ""} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                          <RadioGroup label="Agricultural Land?" name="agri" value={formData.agri} onChange={(val) => setFormData({...formData, agri: val})} />
                        </>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Additional Remarks</label>
                      <textarea className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold h-24" placeholder="Mention any specific requirements..." value={formData.moreDetails || ""} onChange={(e) => setFormData({ ...formData, moreDetails: e.target.value })} />
                    </div>

                    {/* UPLOAD */}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[32px] cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all group">
                      <Upload className="text-gray-300 group-hover:text-blue-500 mb-2" size={24} />
                      <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest text-center px-4">
                        {formData.newFile ? formData.newFile.name : "Tap to upload applicant documents"}
                      </span>
                      <input type="file" className="hidden" onChange={(e) => setFormData({ ...formData, newFile: e.target.files[0] })} />
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-[#050C25] text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing..." : activeView === "add" ? "Submit Application" : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            )}

            {activeView === "target" && (
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 max-w-md mx-auto shadow-2xl text-center">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target size={32} />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 uppercase mb-8">Target Progress</h2>
                 <div className="space-y-4">
                    <TargetItem label="Disbursed" value={targetProgress.completedAmount} color="green" />
                    <TargetItem label="Remaining" value={targetProgress.remainingAmount} color="orange" />
                    <TargetItem label="Goal" value={targetProgress.targetAmount} color="blue" />
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-8 py-4 flex justify-between items-center sm:hidden z-50">
        <NavItem icon={<LayoutGrid />} label="Home" active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} />
        <div className="absolute left-1/2 -translate-x-1/2 -top-8">
          <button 
            onClick={() => { setLoanType(""); setFormData({}); setActiveView("add"); }} 
            className="w-16 h-16 bg-[#050C25] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white active:scale-90 transition-transform"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
        <NavItem icon={<History />} label="History" active={activeView === "all-leads"} onClick={() => setActiveView("all-leads")} />
      </nav>

      {selectedLead && <ApplicationDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={fetchDashboardData} />}
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const StatCard = ({ label, value, icon, color, onClick }) => {
  const themes = {
    blue: "bg-blue-600 text-white border-blue-500",
    green: "bg-emerald-500 text-white border-emerald-400",
    indigo: "bg-[#0A1D37] text-white border-slate-800",
  };
  return (
    <div onClick={onClick} className={`min-w-[160px] flex-1 p-6 rounded-[28px] border shadow-lg flex flex-col gap-4 cursor-pointer active:scale-95 transition-all ${themes[color]}`}>
      <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
        <h3 className="text-xl font-black tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const MiniCard = ({ label, count, icon, onClick }) => (
  <div onClick={onClick} className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center text-center shadow-sm active:scale-95 transition-all cursor-pointer">
    <div className="mb-2 p-2 bg-gray-50 rounded-xl">{icon}</div>
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-tight">{label}</p>
    <p className="text-sm text-slate-900 font-black mt-1">{count}</p>
  </div>
);

const ToolItem = ({ icon, label, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-3 cursor-pointer group">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</span>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="space-y-1 w-full text-left">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">{label}</label>
    <input className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-[11px] font-black focus:ring-2 focus:ring-blue-100 outline-none transition-all uppercase" {...props} />
  </div>
);

const RadioGroup = ({ label, name, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase">{label}</label>
    <div className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-100">
      {['yes', 'no'].map(opt => (
        <label key={opt} className="text-[11px] font-black uppercase flex items-center gap-2 cursor-pointer">
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={(e) => onChange(e.target.value)} className="accent-blue-600" /> {opt}
        </label>
      ))}
    </div>
  </div>
);

const TargetItem = ({ label, value, color }) => {
  const colors = { green: "bg-green-50 text-green-700", orange: "bg-orange-50 text-orange-700", blue: "bg-blue-50 text-blue-700" };
  return (
    <div className={`flex justify-between p-4 rounded-2xl font-black text-xs uppercase ${colors[color]}`}>
      <span>{label}</span>
      <span>₹{value?.toLocaleString()}</span>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active ? 'text-blue-600' : 'text-gray-300'}`} onClick={onClick}>
    {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
    <span className="text-[9px] font-black uppercase">{label}</span>
  </div>
);

export default ClientDashboard;