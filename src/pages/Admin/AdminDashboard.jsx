import React, { useEffect, useState, useCallback, useContext } from "react";
import API from "../../api/axiosInstance";
import {
  FileText,
  CheckCircle,
  TrendingUp,
  Search,
  X,
  IndianRupee,
  Clock,
  Target,
  ArrowLeft,
  RefreshCcw,
  UserPlus,
  UserX,
  UserCheck,
  Users,
  CalendarRange,
  Check,
  XCircle,
  UserMinus,
  LogOut,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import AdminLeadTable from "../../components/AdminLeadTable";
import TargetView from "../../components/TargetView";
import toast from "react-hot-toast";
import ApplicationDetail from "../../components/ApplicationDetail";
import ClientDetailView from "../../components/ClientDetailView";
import ClientCard from "../../components/ClientCard";
import EMICalculator from "../../components/EMICalculator";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadFilter, setLeadFilter] = useState("ALL");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loanTypeFilter, setLoanTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    disbursedCount: 0,
    totalBusinessValue: 0,
    insuranceCount: 0,
  });

  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const searchDebounce = React.useRef(null);

  if (!user) {
    logout();
    navigate("/");
  }

  const handleLogOut = () => {
    logout();
    navigate("/");
  };

  // Debounced search handler
  const handleSearchInput = (value) => {
    setSearchInput(value);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(value);
      setPagination(p => ({ ...p, page: 1 }));
    }, 400);
  };

  const fetchPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsRes, pendingRes] = await Promise.all([
        API.get("/users/clients"),
        API.get("/users/pending"),
      ]);
      setClients(clientsRes.data.data || []);
      setPendingUsers(pendingRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/users/approve/${id}`);
      toast.success("Agent Approved!");
      fetchAdminData(); // Refresh lists
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?"))
      return;
    try {
      await API.put(`/users/reject/${id}`);
      toast.success("User rejected successfully");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject user");
    }
  };


  

  // Fetch paginated leads (called whenever page/filter/search changes)
  const fetchLeads = useCallback(async (page = 1, filter = 'ALL', search = '', loanType = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (filter !== 'ALL') params.status = filter;
      if (search) params.search = search;
      if (loanType) params.loanType = loanType;
      const res = await API.get('/leads/all', { params });
      setLeads(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsRes, statsRes, clientsRes, pendingRes, leavesRes, attendanceRes] =
        await Promise.all([
          API.get("/leads/all", { params: { page: 1, limit: 15 } }),
          API.get("/leads/stats"),
          API.get("/users/clients"),
          API.get("/users/pending"),
          API.get("/leaves/admin/all"),
          API.get("/attendance/admin/today-logs"),
        ]);

      const pageLeads = leadsRes.data.data || [];
      const paginationInfo = leadsRes.data.pagination || {};
      const statsData = statsRes.data.data || {};

      setLeads(pageLeads);
      setPagination(paginationInfo);
      setClients(clientsRes.data.data || []);
      setStats({
        totalCount: statsData.totalCount || paginationInfo.total || 0,
        pendingCount: statsData.pendingCount || 0,
        disbursedCount: statsData.disbursedCount || 0,
        totalBusinessValue: statsData.totalBusinessValue || 0,
        insuranceCount: statsData.insuranceCount || 0,
      });
      setPendingUsers(pendingRes.data.data || []);
      setLeaves(leavesRes.data.data || []);
      setAttendance(attendanceRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatClick = (type) => {
    setSelectedLead(null);

    switch (type) {
      case "TOTAL":
        setLeadFilter("ALL");
        setLoanTypeFilter('');
        setActiveView("dashboard");
        break;

      case "PENDING":
        setLeadFilter("NEW LEAD");
        setLoanTypeFilter('');
        setActiveView("dashboard");
        break;

      case "DISBURSED":
        setLeadFilter("Disbursed");
        setLoanTypeFilter('');
        setActiveView("dashboard");
        break;

      case "INSURANCE":
        setLeadFilter("ALL");
        setLoanTypeFilter("Vehicle Insurance");
        setActiveView("dashboard");
        break;

      case "LEAVES":
        setActiveView("leaves");
        break;

      case "ATTENDANCE":
        setActiveView("attendance");
        break;

      case "APPROVALS":
        setActiveView("approvals");
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Re-fetch leads when filter, search, or page changes
  useEffect(() => {
    fetchLeads(pagination.page, leadFilter, searchQuery, loanTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadFilter, loanTypeFilter, searchQuery, pagination.page]);

  const handleLeaveStatus = async (id, status) => {
    try {
      await API.patch(`/leaves/admin/status/${id}`, { status });
      toast.success(`Leave ${status} successfully`);
      fetchAdminData(); // Refresh list
    } catch (err) {
      toast.error("Failed to update leave status");
    }
  };



  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("WARNING: Deleting this agent will remove all their leads and targets. Continue?")) return;
    try {
      await API.delete(`/users/${clientId}`);
      toast.success("Agent and associated data removed");
      setClients(clients.filter(c => c._id !== clientId));
      setActiveView("dashboard"); // Return to main view after deletion
    } catch (err) {
      toast.error("Failed to delete agent");
    }
  };

  


  const handleDeleteLead = async (leadId) => {
  if (window.confirm("Are you sure you want to delete this lead?")) {
    try {
      await API.delete(`/leads/${leadId}`);
      toast.success("Lead removed");
      // Refresh your lead list here
      fetchAdminData(); 
    } catch (err) {
      toast.error("Delete failed");
    }
  }
};

  // ApplicationDetail.jsx
  const handleDownload = async (url, name) => {
    try {
      const response = await API.get("/leads/download", {
        params: { url, name },
        responseType: "blob", // This tells Axios to handle binary data
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", name || "file.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download Error:", err);
      toast.error("Failed to download file");
    }
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCcw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // leads are already filtered/paginated server-side
  const filteredLeads = leads;

  

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between  gap-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-end w-full px-8  ">
          <div>
            <h1 className="text-3xl font-black text-[#0A1D37] tracking-tight uppercase">
              Admin Command Center
            </h1>
            <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
              Sri Sri Associates • Admin Dashboard
            </p>
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={fetchAdminData}
              className="p-3 bg-gray-50 rounded-xl hover:text-blue-600"
            >
              <RefreshCcw size={18} />
            </button>
            <div className="flex  grow gap-3">
              <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <Clock className="text-blue-600" size={18} />
                <span className="text-xs font-black text-slate-700 uppercase">
                  {new Date().toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogOut();
              }}
              className="flex items-center gap-2 bg-[#db0f0f] text-white px-6 py-3 rounded-2xl shadow-lg font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {selectedClient ? (
          <ClientDetailView
            client={selectedClient}
            onBack={() => setSelectedClient(null)}
            onDelete={handleDeleteClient}
          />
        ) : activeView === "clients" ? (
          <>
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-xs font-black mb-6"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clients.map((client) => (
                <ClientCard
                  key={client._id}
                  client={client}
                  onView={() => setSelectedClient(client)} 
                  onDelete={() => handleDeleteClient(client._id)}
                />
              ))}
            </div>
          </>
        ) : activeView === "dashboard" ? (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard
                label="Total Leads"
                value={stats.totalCount}
                icon={<FileText />}
                onClick={() => handleStatClick("TOTAL")}
              />

              <StatCard
                label="Leave Requests"
                value={leaves.filter((l) => l.status === "Pending").length}
                icon={<CalendarRange />}
                onClick={() => handleStatClick("LEAVES")}
              />

              <StatCard
                label="Approvals"
                value={pendingUsers.length}
                icon={<UserPlus />}
                onClick={() => handleStatClick("APPROVALS")}
              />

              <StatCard
                label="Pending"
                value={stats.pendingCount}
                icon={<Clock />}
                onClick={() => handleStatClick("PENDING")}
              />

              <StatCard
                label="Disbursed"
                value={stats.disbursedCount}
                icon={<CheckCircle />}
                onClick={() => handleStatClick("DISBURSED")}
              />

              <StatCard
                label="Business"
                value={`₹${(stats.totalBusinessValue / 100000).toFixed(2)}L`}
                icon={<IndianRupee />}
                dark
              />

              <StatCard
                label="Active Today"
                value={attendance.filter((a) => a.status === "IN").length}
                icon={<UserCheck />}
                onClick={() => handleStatClick("ATTENDANCE")}
              />

              <StatCard
                label="Insurance"
                value={stats.insuranceCount}
                icon={<ShieldCheck className="text-emerald-500" />}
                onClick={() => handleStatClick("INSURANCE")}
              />
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 mb-6">
              {[
                { label: "ALL", value: "ALL" },
                { label: "PENDING", value: "NEW LEAD" },
                { label: "DISBURSED", value: "Disbursed" },
              ].map(({ label, value: f }) => (
                <button
                  key={f}
                  onClick={() => { setLeadFilter(f); setLoanTypeFilter(''); }}
                  className={`px-4 py-2 rounded-full text-xs font-black ${
                    leadFilter === f && !loanTypeFilter
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setActiveView("targets")}
                className="ml-auto px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-black flex items-center gap-2"
              >
                <Target size={14} /> Targets
              </button>
              <button
                onClick={() => setActiveView("approvals")}
                className="ml-auto px-4 py-2 bg-orange-500 text-white rounded-full text-xs font-black flex items-center gap-2"
              >
                <UserPlus size={14} /> Pending Approvals ({pendingUsers.length})
              </button>

              <button
                onClick={() => setActiveView("clients")}
                className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 ${
                  activeView === "clients"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Users size={14} /> View All Clients
              </button>

              <button
                onClick={() => setActiveView("leaves")}
                className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-black flex items-center gap-2"
              >
                <CalendarRange size={14} /> Leave Management
              </button>

              <button
                onClick={() => setActiveView("attendance")}
                className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 ${
                  activeView === "attendance"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Clock size={14} /> Live Attendance
              </button>

              <button
                onClick={() => setActiveView("emi")}
                className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 ${
                  activeView === "emi"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Calculator size={14} /> EMI Calculator
              </button>
            </div>

            {/* TABLE */}
            <div className="mb-6 relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search leads by name, mobile, loan type..."
                className="w-full pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Loading overlay for pagination */}
            {loading && (
              <div className="flex justify-center py-4">
                <RefreshCcw className="animate-spin text-blue-400" size={20} />
              </div>
            )}

            <AdminLeadTable
              leads={filteredLeads}
              onUpdate={() => fetchLeads(pagination.page, leadFilter, searchQuery, loanTypeFilter)}
              onDelete={handleDeleteLead}
              onDownload={handleDownload}
              onSelectLead={(lead) => setSelectedLead(lead)}
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total} leads
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const pg = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPagination(p => ({ ...p, page: pg }))}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                          pg === pagination.page
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {selectedLead && (
              <ApplicationDetail
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdate={fetchAdminData}
              />
            )}
          </>
        ) : activeView === "approvals" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-xs font-black mb-6"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <h2 className="text-xl font-black mb-6 uppercase">
              Pending Agent Requests
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {pendingUsers.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl text-center border border-dashed border-gray-300">
                  <p className="text-gray-400 font-bold">
                    No pending registration requests
                  </p>
                </div>
              ) : (
                pendingUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-white p-6 rounded-3xl border flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h4 className="font-black text-slate-900">{u.name}</h4>
                      <p className="text-xs text-gray-500">{u.email}</p>
                      <p className="text-[10px] text-blue-600 font-black mt-1">
                        Requested on:{" "}
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(u._id)}
                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                      >
                        <UserX size={20} />
                      </button>
                      <button
                        onClick={() => handleApprove(u._id)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all"
                      >
                        <UserCheck size={18} /> Approve Agent
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeView === "clients" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-xs font-black mb-6"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <h2 className="text-xl font-black mb-6 uppercase">
              Registered Agents / Clients
            </h2>

            

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {clients.map((client) => (
                <div
                  key={client._id}
                  className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">
                        {client.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        {client.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="w-full py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    View Full Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeView === "leaves" ? (
          /* LEAVE MANAGEMENT VIEW */
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-xs font-black mb-6"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <h2 className="text-xl font-black mb-6 uppercase">
              Agent Leave Applications
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {leaves.length === 0 ? (
                <div className="bg-white p-10 rounded-[32px] text-center border-2 border-dashed">
                  <p className="text-gray-400 font-bold uppercase text-xs">
                    No leave history found
                  </p>
                </div>
              ) : (
                leaves.map((l) => (
                  <div
                    key={l._id}
                    className="bg-white p-6 rounded-[32px] border shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                        {l.user?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900">
                            {l.user?.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                              l.status === "Pending"
                                ? "bg-orange-100 text-orange-600"
                                : l.status === "Approved"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {l.type} • Applied on{" "}
                          {new Date(l.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-600 mt-2 italic">
                          "{l.reason}"
                        </p>
                      </div>
                    </div>

                    {l.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLeaveStatus(l._id, "Rejected")}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                        >
                          <XCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleLeaveStatus(l._id, "Approved")}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                        >
                          <Check size={18} /> Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeView === "attendance" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-xs font-black mb-6"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-xl font-black uppercase">
                  Daily Attendance Logs
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                  Monitoring for:{" "}
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-600 uppercase">
                    Present
                  </p>
                  <p className="text-lg font-black">{attendance.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                      Agent Name
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                      Punch In
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                      Punch Out
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {log.user?.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">
                            {log.user?.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-xs font-black text-slate-600 uppercase">
                        {new Date(log.punchIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-6 text-xs font-black text-slate-600 uppercase">
                        {log.punchOut
                          ? new Date(log.punchOut).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            log.status === "IN"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {log.status === "IN"
                            ? "Currently Active"
                            : "Logged Out"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && (
                <div className="p-20 text-center text-gray-400 font-bold uppercase text-xs">
                  No one has punched in yet today.
                </div>
              )}
            </div>
          </div>
        ) : activeView === "emi" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-xs font-black mb-6"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <EMICalculator adminMode />
          </div>
        ) : (
          <div>
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-2 text-xs font-black mb-6"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <TargetView clients={clients} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- STAT CARD ---------------- */
const StatCard = ({ label, value, icon, dark, onClick }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-3xl border shadow-sm cursor-pointer transition-all active:scale-95 hover:shadow-md ${
      dark ? "bg-[#0A1D37] text-white" : "bg-white"
    }`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[9px] font-black uppercase text-gray-400">{label}</p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${dark ? "bg-white/10" : "bg-gray-50"}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
  </div>
);

export default AdminDashboard;
