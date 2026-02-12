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
  MapPin,
  LogIn,
  LogOut,
  CalendarX,
  ShieldCheck,
  Layers,
  X,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
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
  const [attendanceStatus, setAttendanceStatus] = useState("OUT");
  const [punchTime, setPunchTime] = useState(null);
  const [showLeaveModel, setShowLeaveModel] = useState(false);
  const [loanType, setLoanType] = useState("");
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [leaves, setLeaves] = useState([]);

  const navigator = useNavigate();
  const handleLogOut = () => {
    logout();
    navigator("/");
  };
  const fetchAttendance = useCallback(async () => {
    try {
      const { data } = await API.get("/attendance/today");
      if (data.record) {
        setAttendanceStatus(data.record.status);
        setPunchTime(data.record.punchIn);
      }
    } catch (err) {
      console.log("No attendance record for today yet");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handlePunch = async () => {
    const action = attendanceStatus === "OUT" ? "in" : "out";
    try {
      const { data } = await API.post(`/attendance/punch-${action}`);
      setAttendanceStatus(action === "in" ? "IN" : "OUT");
      setPunchTime(action === "in" ? data.time : null);
      toast.success(`Successfully Punched ${action.toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Attendance failed");
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data } = await API.get("/leads/my-leads");
      const all = data.data;
      setLeads(all);
      setStats({
        total: all.length,
        disbursed: all.filter((l) => l.status === "Disbursed").length,
        pending: all.filter((l) => l.isFinished && l.status !== "Disbursed")
          .length,
        unfinished: all.filter((l) => !l.isFinished).length,
      });
    } catch (err) {
      toast.error("Error loading leads");
    }
  }, []);

  const fetchLeaveData = useCallback(async () => {
    try {
      const { data } = await API.get("/leaves/my-leaves");
      setLeaves(data.data || []);
    } catch (err) {
      toast.error("Error fetching leave data");
    }
  }, []);

  const fetchTargetData = useCallback(async () => {
    try {
      const { data } = await API.get("/targets/progress", {
        params: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
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

  const handleAction = async (e) => {
    e.preventDefault();
    if (!loanType) return toast.error("Please select a loan type first");

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      activeView === "add" ? "Creating Application..." : "Saving Changes...",
    );

    try {
      const data = new FormData();

      const { id, newFiles, ...restOfFields } = formData;

      data.append("loanType", loanType);

      Object.keys(restOfFields).forEach((key) => {
        if (restOfFields[key] !== undefined && restOfFields[key] !== null) {
          data.append(key, restOfFields[key]);
        }
      });

      if (newFiles && newFiles.length > 0) {
        newFiles.forEach((file) => {
          data.append("documents", file);
        });
      }

      if (activeView === "add") {
        await API.post("/leads/create", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lead Created Successfully!", { id: loadingToast });
      } else {
        await API.put(`/leads/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Application Updated Successfully!", {
          id: loadingToast,
        });
      }

      await fetchDashboardData();
      setActiveView("dashboard");
      setFormData({});
      setLoanType("");
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error(err.response?.data?.message || "Error submitting form", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insuranceLeads = leads.filter(
    (l) => l.loanType === "Vehicle Insurance",
  );

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.customerName?.toLowerCase().includes(query) ||
      lead.mobileNumber?.includes(query) ||
      lead.loanType?.toLowerCase().includes(query) ||
      lead.loanDetails?.vehicleNumber?.toLowerCase().includes(query) ||
      lead.loanDetails?.policyNumber?.toLowerCase().includes(query)
    );
  });
  return (
    <div className="bg-[#F8FAFF] min-h-screen pb-32 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 py-8">
          <div>
            <h1 className="text-3xl font-black text-[#0A1D37] tracking-tight uppercase">
              Welcome, {user?.name?.split(" ")[0] || "Partner"}
            </h1>
            <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
              Sri Sri Associates • Agent Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <Clock className="text-blue-600" size={18} />
              <span className="text-xs font-black text-slate-700 uppercase">
                {new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <button
              onClick={() => {
                setLoanType("");
                setFormData({});
                setActiveView("add");
              }}
              className="flex items-center gap-2 bg-[#050C25] text-white px-6 py-3 rounded-2xl shadow-lg font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              <Plus size={18} /> New Lead
            </button>
            <button
              onClick={() => {
                handleLogOut();
              }}
              className="flex items-center gap-2 bg-[#db0f0f] text-white px-6 py-3 rounded-2xl shadow-lg font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          <StatCard
            label="Incomplete"
            value={stats.unfinished}
            icon={<AlertCircle />}
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
            label="Total Target"
            value={`₹${targetProgress.targetAmount?.toLocaleString()}`}
            icon={<Target />}
            color="indigo"
            onClick={() => setActiveView("target")}
          />
        </div>

        {/* Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <MiniCard
            label="Total Leads"
            count={stats.total}
            icon={<FileText size={18} className="text-blue-500" />}
            onClick={() => setActiveView("all-leads")}
          />
          <MiniCard
            label="Fix Missing"
            count={stats.unfinished}
            icon={<History size={18} className="text-orange-500" />}
            onClick={() => setActiveView("unfinished")}
          />
          <MiniCard
            label="In Review"
            count={stats.pending}
            icon={<Clock size={18} className="text-teal-500" />}
            onClick={() => setActiveView("pending")}
          />
          <MiniCard
            label="Success"
            count={stats.disbursed}
            icon={<Calculator size={18} className="text-blue-400" />}
            onClick={() => setActiveView("disbursed")}
          />
        </div>

        {/* Dynamic Content Area */}

        {activeView === "leave-requests" ? (
          <>
            <div className="mt-10 space-y-8">
              <div>
                <button
                  onClick={() => setActiveView("dashboard")}
                  className="flex items-center gap-2 text-gray-400 hover:text-slate-900 mb-6 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Back to Dashbaord
                  </span>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <CalendarX className="text-purple-600" size={16} />
                  My Leave Requests
                </h3>

                {leaves.length > 2 && (
                  <span className="text-[10px] font-black text-gray-400 uppercase animate-pulse">
                    Scroll for more →
                  </span>
                )}
              </div>

              {leaves.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
                  {leaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="min-w-[280px] md:min-w-[350px] flex-shrink-0 bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow snap-start"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-purple-600 uppercase mb-1">
                            {"Leave Request"}
                          </p>

                          <h4 className="font-black text-slate-900 uppercase text-sm">
                            {new Date(leave.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}{" "}
                            - {leave.type}
                          </h4>
                          <p className="mb-4 mt-1 text-[10px] font-bold text-gray-500 uppercase">
                            Leave Status:{" "}
                            <span
                              className={`${
                                leave.status === "Approved"
                                  ? " text-green-600"
                                  : leave.status === "Rejected"
                                    ? " text-red-600"
                                    : " text-orange-600"
                              }`}
                            >
                              {leave.status}
                            </span>
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            leave.status === "Approved"
                              ? "bg-green-50 text-green-600"
                              : leave.status === "Rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>

                      <div className="mb-4 text-[10px] font-bold text-gray-500 uppercase">
                        Reason:{" "}
                        <span className="text-slate-900">
                          {leave.reason || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 uppercase font-bold">
                  No leave requests found.
                </p>
              )}
            </div>
          </>
        ) : activeView === "dashboard" ? (
          <div className="mt-10 space-y-8">
            {/* Target Progress Bar */}
            {targetProgress.targetAmount > 0 && (
              <div className="bg-[#0A1D37] rounded-4xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                      Monthly Performance
                    </h3>
                    <span className="text-2xl font-black italic">
                      {Math.round(
                        (targetProgress.completedAmount /
                          targetProgress.targetAmount) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000"
                      style={{
                        width: `${Math.min((targetProgress.completedAmount / targetProgress.targetAmount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                    <span>
                      Achieved: ₹
                      {targetProgress.completedAmount?.toLocaleString()}
                    </span>
                    <span>
                      Goal: ₹{targetProgress.targetAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <ShieldCheck className="text-blue-600" size={16} />
                  Vehicle Insurance Policies
                </h3>
                {insuranceLeads.length > 2 && (
                  <span className="text-[10px] font-black text-gray-400 uppercase animate-pulse">
                    Scroll for more →
                  </span>
                )}
              </div>

              {insuranceLeads.length > 0 ? (
                /* Changed from grid to horizontal flex with overflow */
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
                  {insuranceLeads.map((policy) => (
                    <div
                      key={policy._id}
                      /* Added min-w and flex-shrink-0 to prevent card squeezing */
                      className="min-w-[280px] md:min-w-[350px] flex-shrink-0 bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow snap-start"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-1">
                            {policy.loanDetails?.insuranceProvider ||
                              "Insurance Policy"}
                          </p>
                          <h4 className="font-black text-slate-900 uppercase text-sm">
                            {policy.loanDetails?.vehicleNumber || "No Plate"}
                          </h4>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            policy.status === "Approved"
                              ? "bg-green-50 text-green-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {policy.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-[10px] font-bold text-gray-500 uppercase">
                        <div>
                          Exp:{" "}
                          <span className="text-slate-900">
                            {policy.loanDetails?.endDate || "N/A"}
                          </span>
                        </div>
                        <div>
                          Amount:{" "}
                          <span className="text-slate-900">
                            ₹{policy.loanAmount?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedLead(policy)}
                          className="flex-1 py-2 bg-slate-50 text-slate-900 rounded-xl font-black text-[9px] uppercase hover:bg-slate-100"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-4xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                  <ShieldCheck size={40} className="text-gray-200 mb-4" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    No Insurance Found
                  </p>
                  <button
                    onClick={() => {
                      setLoanType("Vehicle Insurance");
                      setActiveView("add");
                    }}
                    className="mt-4 text-[10px] font-black text-blue-600 uppercase border-b-2 border-blue-600 pb-1"
                  >
                    Add New Policy
                  </button>
                </div>
              )}
            </div>

            {/* ATTENDANCE & LEAVE SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Attendance Card */}
              <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${attendanceStatus === "IN" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
                  >
                    {attendanceStatus === "IN" ? (
                      <LogOut size={24} />
                    ) : (
                      <LogIn size={24} />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Daily Attendance
                    </p>
                    <h4 className="text-sm font-black text-slate-900 uppercase">
                      {attendanceStatus === "IN"
                        ? `Punched In at ${new Date(punchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "Not Punched In"}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={handlePunch}
                  className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                    attendanceStatus === "IN"
                      ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white"
                      : "bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700"
                  }`}
                >
                  {attendanceStatus === "IN" ? "Punch Out" : "Punch In"}
                </button>
              </div>

              {/* Leave Card */}
              <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <CalendarX size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Time Off
                    </p>
                    <h4 className="text-sm font-black text-slate-900 uppercase">
                      Request Leave
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setShowLeaveModel(true)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Apply Leave
                </button>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 flex items-center gap-1 text-xs uppercase tracking-widest">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>{" "}
                Quick Services
              </h3>
              <div className="bg-white border border-gray-100 rounded-4xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 shadow-sm">
                <ToolItem
                  icon={<CalendarX />}
                  label="Leave request"
                  onClick={() => {
                    fetchDashboardData();
                    fetchLeaveData();
                    setActiveView("leave-requests");
                  }}
                />
                <ToolItem
                  icon={<Calculator />}
                  label="EMI Calc"
                  onClick={() => setActiveView("emi")}
                />
                <ToolItem
                  icon={<History />}
                  label="Lead History"
                  onClick={() => setActiveView("all-leads")}
                />
                <ToolItem
                  icon={<RefreshCcw />}
                  label="Sync Data"
                  onClick={() => {
                    fetchDashboardData();
                    fetchTargetData();
                  }}
                />
                
              </div>
            </div>

            {/* Recent Leads Preview */}
            <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Recent Applications
                </h3>
                <button
                  onClick={() => setActiveView("all-leads")}
                  className="text-[10px] font-black text-blue-600 uppercase"
                >
                  View All
                </button>
              </div>
              {/* search input */}
              <div className="mb-8 m-3 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <RefreshCcw
                    className="text-gray-400 animate-spin-slow"
                    size={18}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, mobile, vehicle number or policy..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <LeadHistory
                leads={
                  activeView === "unfinished"
                    ? filteredLeads.filter((l) => !l.isFinished) // Use filteredLeads
                    : activeView === "pending"
                      ? filteredLeads.filter(
                          (l) => l.isFinished && l.status !== "Disbursed",
                        ) // Use filteredLeads
                      : activeView === "disbursed"
                        ? filteredLeads.filter((l) => l.status === "Disbursed") // Use filteredLeads
                        : filteredLeads // Use filteredLeads
                }
                onLeadClick={setSelectedLead}
                onEditClick={handleEditInit}
              />
            </div>
          </div>
        ) : (
          <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Back to Overview
              </span>
            </button>

            {activeView === "emi" && <EMICalculator />}

            {["all-leads", "unfinished", "pending", "disbursed"].includes(
              activeView,
            ) && (
              <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-xl">
                <LeadHistory
                  leads={
                    activeView === "unfinished"
                      ? leads.filter((l) => !l.isFinished)
                      : activeView === "pending"
                        ? leads.filter(
                            (l) => l.isFinished && l.status !== "Disbursed",
                          )
                        : activeView === "disbursed"
                          ? leads.filter((l) => l.status === "Disbursed")
                          : leads
                  }
                  onLeadClick={setSelectedLead}
                  onEditClick={handleEditInit}
                />
              </div>
            )}

            {(activeView === "add" || activeView === "edit") && (
              <form
                onSubmit={handleAction}
                className="bg-white p-8 rounded-4xl border border-gray-100 space-y-6 max-w-2xl mx-auto shadow-2xl mb-20"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {activeView === "add"
                      ? "New Application"
                      : "Update Application"}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    Please ensure all details are accurate
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                    Loan Type
                  </label>
                  <select
                    disabled={activeView === "edit"}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xs uppercase appearance-none"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                  >
                    <option value="">-- Choose Category --</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Vehicle Loan">Vehicle Loan</option>
                    <option value="Vehicle Insurance">Vehicle Insurance</option>
                    <option value="Other Loan Types">Other Loan Types</option>
                  </select>
                </div>

                {loanType && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Customer Name"
                        required
                        value={formData.customerName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Mobile Number"
                        required
                        value={formData.mobileNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mobileNumber: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Required Amount"
                        type="number"
                        required
                        value={formData.loanAmount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loanAmount: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Document ID (PAN/Aadhar)"
                        value={formData.docType || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, docType: e.target.value })
                        }
                      />
                    </div>

                    {/* DYNAMIC FIELDS */}

                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(loanType === "Home Loan" ||
                        loanType === "LAP Loan") && (
                        <>
                          <InputField
                            label="Total Sq. Ft"
                            type="number"
                            value={formData.sqFt || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, sqFt: e.target.value })
                            }
                          />
                          <InputField
                            label="Property Area"
                            value={formData.area || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, area: e.target.value })
                            }
                          />
                          <InputField
                            label="Estimated Market Value"
                            value={formData.houseValue || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                houseValue: e.target.value,
                              })
                            }
                          />
                        </>
                      )}

                      {loanType === "Vehicle Insurance" && (
                        <>
                          <InputField
                            label="Insurance Provider"
                            value={formData.insuranceProvider || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                insuranceProvider: e.target.value,
                              })
                            }
                          />
                          <InputField
                            label="Policy Number"
                            value={formData.policyNumber || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                policyNumber: e.target.value,
                              })
                            }
                          />
                          <InputField
                            label="Vehicle Number"
                            value={formData.vehicleNumber || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vehicleNumber: e.target.value,
                              })
                            }
                          />
                          <InputField
                            label="Coverage Type"
                            placeholder="e.g. Comprehensive"
                            value={formData.coverageType || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                coverageType: e.target.value,
                              })
                            }
                          />
                          <InputField
                            label="IDV Value"
                            type="number"
                            value={formData.idv || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, idv: e.target.value })
                            }
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <InputField
                              label="Start Date"
                              type="date"
                              value={formData.startDate || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  startDate: e.target.value,
                                })
                              }
                            />
                            <InputField
                              label="End Date"
                              type="date"
                              value={formData.endDate || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  endDate: e.target.value,
                                })
                              }
                            />
                          </div>
                        </>
                      )}

                      {(loanType === "Personal Loan" ||
                        loanType === "Business Loan") && (
                        <>
                          <InputField
                            label="Monthly/Annual Income"
                            type="number"
                            value={formData.income || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                income: e.target.value,
                              })
                            }
                          />
                          <InputField
                            label="Residence Status"
                            value={formData.residence || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                residence: e.target.value,
                              })
                            }
                          />
                        </>
                      )}

                      {loanType === "Business Loan" && (
                        <>
                          <RadioGroup
                            label="ITR / GST Available?"
                            name="itr_gst"
                            value={formData.itr_gst}
                            onChange={(val) =>
                              setFormData({ ...formData, itr_gst: val })
                            }
                          />
                          <RadioGroup
                            label="Labour License?"
                            name="labourLic"
                            value={formData.labourLic}
                            onChange={(val) =>
                              setFormData({ ...formData, labourLic: val })
                            }
                          />
                        </>
                      )}

                      {loanType === "Vehicle Loan" && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">
                              Vehicle Type
                            </label>
                            <select
                              className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase"
                              value={formData.vehicleType || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  vehicleType: e.target.value,
                                })
                              }
                            >
                              <option value="">-- Select --</option>
                              <option value="Car">Car</option>
                              <option value="Bike">Bike</option>
                              <option value="Tractor">Tractor</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <InputField
                            label="Brand/Model"
                            value={formData.vehicleModel || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vehicleModel: e.target.value,
                              })
                            }
                          />
                          <InputField
                            label="Vehicle Number"
                            value={formData.vehicleNumber || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vehicleNumber: e.target.value,
                              })
                            }
                          />
                          <RadioGroup
                            label="Agricultural Land?"
                            name="agri"
                            value={formData.agri}
                            onChange={(val) =>
                              setFormData({ ...formData, agri: val })
                            }
                          />
                        </>
                      )}

                      {
                        loanType === "Other Loan Types" && (
                  <InputField
                    label="Loan Type"
                    value={formData.additionalDetails || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalDetails: e.target.value,
                      })
                    }
                    placeholder="Specify loan type"
                  />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                        Additional Remarks
                      </label>
                      <textarea
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold h-24"
                        placeholder="Mention any specific requirements..."
                        value={formData.moreDetails || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            moreDetails: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* UPLOAD */}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[32px] cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all group">
                      <Upload
                        className="text-gray-300 group-hover:text-blue-500 mb-2"
                        size={24}
                      />
                      <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest text-center px-4">
                        {formData.newFile
                          ? formData.newFile.name
                          : "Tap to upload applicant documents"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setFormData({ ...formData, newFiles: files });
                        }}
                        id="file-upload"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-[#050C25] text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Processing..."
                        : activeView === "add"
                          ? "Submit Application"
                          : "Save Changes"}
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
                <h2 className="text-xl font-black text-slate-900 uppercase mb-8">
                  Target Progress
                </h2>
                <div className="space-y-4">
                  <TargetItem
                    label="Disbursed"
                    value={targetProgress.completedAmount}
                    color="green"
                  />
                  <TargetItem
                    label="Remaining"
                    value={Math.max(
                      0,
                      targetProgress.targetAmount -
                        targetProgress.completedAmount,
                    )}
                    color="orange"
                  />
                  <TargetItem
                    label="Goal"
                    value={targetProgress.targetAmount}
                    color="blue"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-8 py-4 flex justify-between items-center sm:hidden z-50">
        <NavItem
          icon={<LayoutGrid />}
          label="Home"
          active={activeView === "dashboard"}
          onClick={() => setActiveView("dashboard")}
        />
        <div className="absolute left-1/2 -translate-x-1/2 -top-8">
          <button
            onClick={() => {
              setLoanType("");
              setFormData({});
              setActiveView("add");
            }}
            className="w-16 h-16 bg-[#050C25] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white active:scale-90 transition-transform"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
        <NavItem
          icon={<History />}
          label="History"
          active={activeView === "all-leads"}
          onClick={() => setActiveView("all-leads")}
        />
      </nav>

      {selectedLead && (
        <ApplicationDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={fetchDashboardData}
        />
      )}

      {showLeaveModel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase text-slate-900">
                  Apply for Leave
                </h2>
                <button
                  onClick={() => setShowLeaveModel(false)}
                  className="p-2 bg-gray-50 rounded-full text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const payload = Object.fromEntries(formData);
                  try {
                    await API.post("/leaves/apply", payload);
                    toast.success("Leave application submitted!");
                    setShowLeaveModel(false);
                  } catch (err) {
                    toast.error("Failed to submit leave");
                    console.error(err);
                  }
                }}
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                    Leave Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xs uppercase outline-none"
                  >
                    <option value="Full Day">Full Day Leave</option>
                    <option value="Half Day">Half Day (Morning)</option>
                    <option value="Half Day">Half Day (Afternoon)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    required
                    placeholder="Briefly explain the reason..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs h-32 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color, onClick }) => {
  const themes = {
    blue: "bg-blue-600 text-white border-blue-500",
    green: "bg-emerald-500 text-white border-emerald-400",
    indigo: "bg-[#0A1D37] text-white border-slate-800",
  };
  return (
    <div
      onClick={onClick}
      className={`min-w-[160px] flex-1 p-6 rounded-[28px] border shadow-lg flex flex-col gap-4 cursor-pointer active:scale-95 transition-all ${themes[color]}`}
    >
      <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">
          {label}
        </p>
        <h3 className="text-xl font-black tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const MiniCard = ({ label, count, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center text-center shadow-sm active:scale-95 transition-all cursor-pointer"
  >
    <div className="mb-2 p-2 bg-gray-50 rounded-xl">{icon}</div>
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-tight">
      {label}
    </p>
    <p className="text-sm text-slate-900 font-black mt-1">{count}</p>
  </div>
);

const ToolItem = ({ icon, label, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center gap-3 cursor-pointer group"
  >
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
      {label}
    </span>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="space-y-1 w-full text-left">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
      {label}
    </label>
    <input
      className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-[11px] font-black focus:ring-2 focus:ring-blue-100 outline-none transition-all uppercase"
      {...props}
    />
  </div>
);

const RadioGroup = ({ label, name, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase">
      {label}
    </label>
    <div className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-100">
      {["yes", "no"].map((opt) => (
        <label
          key={opt}
          className="text-[11px] font-black uppercase flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            className="accent-blue-600"
          />{" "}
          {opt}
        </label>
      ))}
    </div>
  </div>
);

const TargetItem = ({ label, value, color }) => {
  const colors = {
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div
      className={`flex justify-between p-4 rounded-2xl font-black text-xs uppercase ${colors[color]}`}
    >
      <span>{label}</span>
      <span>₹{value?.toLocaleString()}</span>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active ? "text-blue-600" : "text-gray-300"}`}
    onClick={onClick}
  >
    {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
    <span className="text-[9px] font-black uppercase">{label}</span>
  </div>
);

export default ClientDashboard;
