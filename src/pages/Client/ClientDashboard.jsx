import React, { useContext, useEffect, useState } from "react";
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
  Car,
  Target,
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

  useEffect(() => {
    fetchDashboardData();
    fetchTargetData();
  }, []);

  const fetchDashboardData = async () => {
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
      toast.error("Error loading dashboard data");
      console.error("Error fetching dashboard data", err.response?.data || err.message);
    }
  };

  const fetchTargetData = async () => {
    try {
      const { data } = await API.get("/targets/progress", {
        params: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
      setTargetProgress({
        completedAmount: data.completedAmount,
        remainingAmount: data.remainingAmount,
        targetAmount: data.targetAmount,
      });
    } catch (err) {
      console.error("Error fetching target data", err.response?.data || err.message);
    }
  };

  const handleEditInit = (lead) => {
    setLoanType(lead.loanType);
    setFormData({
      id: lead._id,
      customerName: lead.customerName,
      mobileNumber: lead.mobileNumber,
      loanAmount: lead.loanAmount,
      documents: lead.documents,
      ...lead.loanDetails,
    });
    setActiveView("edit");
  };

  const handleAction = async (e) => {
    e.preventDefault();
    if (!loanType) return toast.error("Please select a loan type first");
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      activeView === "add" ? "Creating Application..." : "Saving Changes..."
    );
    try {
      const data = new FormData();
      const { id, customerName, mobileNumber, loanAmount, newFile, documents, ...loanDetails } = formData;
      data.append("customerName", customerName);
      data.append("mobileNumber", mobileNumber);
      data.append("loanAmount", loanAmount);
      data.append("loanType", loanType);
      if (newFile) data.append("documents", newFile);
      Object.keys(loanDetails).forEach((key) => {
        if (loanDetails[key]) data.append(key, loanDetails[key]);
      });
      if (activeView === "add") {
        await API.post("/leads/create", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Lead Created Successfully!", { id: loadingToast });
      } else {
        await API.put(`/leads/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Application Updated Successfully!", { id: loadingToast });
      }
      fetchDashboardData();
      setActiveView("dashboard");
      setFormData({});
      setLoanType("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] min-h-screen pb-28 font-sans w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 py-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0A1D37] tracking-tight uppercase">
            Welcome, {user?.name || "User"}
          </h1>
          <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
            Sri Sri Associates • Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <Clock className="text-blue-600" size={18} />
            <span className="text-xs font-black text-slate-700 uppercase">
              {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </span>
          </div>
          <button
            onClick={() => {
              setLoanType("");
              setFormData({});
              setActiveView("add");
            }}
            className="flex items-center gap-1 bg-[#050C25] text-white px-4 py-2 rounded-xl shadow-md font-bold text-sm active:scale-95"
          >
            <Plus size={16} /> New Lead
          </button>
        </div>
      </header>

      {/* Large Stat Banners */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mt-4">
        <StatCard
          label="Open Lead"
          value={stats.unfinished}
          icon={<FileText />}
          color="blue"
          onClick={() => setActiveView("unfinished")}
        />
        <StatCard
          label="Disbursed"
          value={stats.disbursed}
          icon={<CheckCircle />}
          color="green"
          onClick={() => setActiveView("disbursed")}
        />
        <StatCard
          label="Target"
          value={`₹${targetProgress.completedAmount.toLocaleString()}`}
          icon={<Target />}
          color="indigo"
          onClick={() => setActiveView("target")}
        />
      </div>

      {/* Mini Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        <MiniCard label="Total Leads" count={stats.total} icon={<FileText size={18} className="text-blue-500" />} onClick={() => setActiveView("all-leads")} />
        <MiniCard label="Action Needed" count={stats.unfinished} icon={<History size={18} className="text-orange-500" />} onClick={() => setActiveView("unfinished")} />
        <MiniCard label="In Progress" count={stats.pending} icon={<Clock size={18} className="text-teal-500" />} onClick={() => setActiveView("pending")} />
        <MiniCard label="Disbursed" count={stats.disbursed} icon={<Calculator size={18} className="text-blue-400" />} onClick={() => setActiveView("disbursed")} />
      </div>

      {/* Quick Tools */}
      <div className="space-y-4 mt-6">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <span className="w-1 h-4 bg-slate-900 rounded-full"></span> Quick Tools
        </h3>
        <div className="bg-[#F6FAFF] border border-blue-100 rounded-3xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-x-auto">
          <ToolItem icon={<AlertCircle />} label="Fix Missing" onClick={() => setActiveView("unfinished")} />
          <ToolItem icon={<FileText />} label="Total Leads" onClick={() => setActiveView("all-leads")} />
          <ToolItem icon={<Calculator />} label="EMI Calc" onClick={() => setActiveView("emi")} />
          <ToolItem icon={<History />} label="Lead History" onClick={() => setActiveView("all-leads")} />
        </div>
      </div>

      {/* Dynamic Views */}
      {activeView !== "dashboard" && (
        <div className="animate-in slide-in-from-right duration-300 mt-6 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActiveView("dashboard")}
              className="p-2 bg-gray-100 rounded-full active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-lg capitalize">{activeView.replace("-", " ")}</h1>
          </div>

          {activeView === "emi" && <EMICalculator />}

          {["all-leads", "unfinished", "pending", "disbursed"].includes(activeView) && (
            <LeadHistory
              leads={
                activeView === "unfinished"
                  ? leads.filter((l) => !l.isFinished)
                  : activeView === "pending"
                  ? leads.filter((l) => l.isFinished && l.status !== "Disbursed")
                  : activeView === "disbursed"
                  ? leads.filter((l) => l.status === "Disbursed")
                  : leads
              }
              onLeadClick={setSelectedLead}
              onEditClick={handleEditInit}
            />
          )}

          {(activeView === "add" || activeView === "edit") && (
            <form
              onSubmit={handleAction}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 space-y-4 max-w-md mx-auto"
            >
              {activeView === "add" && (
                <select
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm"
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                >
                  <option value="">-- Choose Loan Type --</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="LAP Loan">LAP Loan</option>
                  <option value="Vehicle Loan">Vehicle Loan</option>
                </select>
              )}

              {loanType && (
                <div className="space-y-4">
                  <InputField
                    label="Customer Name"
                    required
                    value={formData.customerName || ""}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                  <InputField
                    label="Mobile"
                    required
                    value={formData.mobileNumber || ""}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                  <InputField
                    label="Amount"
                    type="number"
                    required
                    value={formData.loanAmount || ""}
                    onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  />
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer">
                    <Upload className="text-gray-300 mb-1" size={20} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      {formData.newFile ? formData.newFile.name : "Upload Docs"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFormData({ ...formData, newFile: e.target.files[0] })}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-lg active:scale-95"
                  >
                    {isSubmitting ? "Processing..." : activeView === "add" ? "Submit" : "Save"}
                  </button>
                </div>
              )}
            </form>
          )}

          {activeView === "target" && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 max-w-md mx-auto">
              <h2 className="font-bold text-lg">Monthly Target Progress</h2>
              <div className="space-y-2 text-sm font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Completed Amount:</span>
                  <span>₹{targetProgress.completedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Amount:</span>
                  <span>₹{targetProgress.remainingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Amount:</span>
                  <span>₹{targetProgress.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)] sm:hidden z-50">
        <div className="flex flex-col items-center gap-1 text-slate-900" onClick={() => setActiveView("dashboard")}>
          <LayoutGrid size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase">Dashboard</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -top-7">
          <button
            onClick={() => {
              setLoanType("");
              setFormData({});
              setActiveView("add");
            }}
            className="w-14 h-14 bg-[#050C25] text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white active:scale-90"
          >
            <Plus size={30} strokeWidth={3} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer" onClick={() => setActiveView("all-leads")}>
          <Car size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase">My Leads</span>
        </div>
      </nav>

      {selectedLead && <ApplicationDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
};

/* --------- Subcomponents --------- */
const StatCard = ({ label, value, icon, color, onClick }) => {
  const theme = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    indigo: "bg-[#0A1D37] text-white border-slate-800",
  };
  return (
    <div onClick={onClick} className={`min-w-37.5 md:min-w-35 flex-1 p-4 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer ${theme[color]}`}>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${color === 'indigo' ? 'text-blue-300' : 'text-gray-400'}`}>
          {label}
        </p>
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      </div>
      <div className={`${color === 'indigo' ? 'bg-white/10' : 'bg-white'} p-3 rounded-2xl shadow-inner`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
  );
};

const MiniCard = ({ label, count, icon, onClick }) => (
  <div onClick={onClick} className="bg-white border border-gray-100 rounded-xl py-3 px-1 flex flex-col items-center text-center shadow-sm active:scale-95 transition-all">
    <div className="mb-2">{icon}</div>
    <p className="text-[9px] font-bold text-slate-800 leading-tight">{label}</p>
    <p className="text-[8px] text-slate-400 mt-0.5 font-medium uppercase">{count}</p>
  </div>
);

const ToolItem = ({ icon, label, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-2 relative cursor-pointer active:scale-90">
    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-gray-50 bg-white">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[9px] font-bold text-slate-700 text-center leading-[1.1] max-w-16.25">{label}</span>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="space-y-1 w-full text-left">
    <label className="text-[10px] font-bold text-gray-400 uppercase">{label}</label>
    <input
      className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 text-sm font-bold"
      {...props}
    />
  </div>
);

export default ClientDashboard;
