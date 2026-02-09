import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/axiosInstance";
import {
  FileText,
  CheckCircle,
  TrendingUp,
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
} from "lucide-react";
import AdminLeadTable from "../../components/AdminLeadTable";
import TargetView from "../../components/TargetView";
import toast from "react-hot-toast";
import ApplicationDetail from "../../components/ApplicationDetail";
import ClientDetailView from "../../components/ClientDetailView";
import ClientCard from "../../components/ClientCard";

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadFilter, setLeadFilter] = useState("ALL"); // ALL | PENDING | DISBURSED
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [leaves, setLeaves] = useState([]);

  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    disbursedCount: 0,
    totalBusinessValue: 0,
  });

  const fetchPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsRes, clientsRes, pendingRes] = await Promise.all([
        API.get("/leads/all"),
        API.get("/users/clients"),
        API.get("/users/pending"),
      ]);

      setLeads(leadsRes.data.data || []);
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

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsRes, clientsRes, pendingRes, leavesRes, attendanceRes] =
        await Promise.all([
          API.get("/leads/all"),
          API.get("/users/clients"),
          API.get("/users/pending"),
          API.get("/leaves/admin/all"),
          API.get("/attendance/admin/today-logs"),
        ]);

      const allLeads = leadsRes.data.data || [];

      const pending = allLeads.filter((l) => l.status === "NEW LEAD");
      const disbursed = allLeads.filter((l) => l.status === "Disbursed");

      setLeads(allLeads);
      setClients(clientsRes.data.data || []);
      setStats({
        totalCount: allLeads.length,
        pendingCount: pending.length,
        disbursedCount: disbursed.length,
        totalBusinessValue: disbursed.reduce(
          (sum, l) => sum + (Number(l.loanAmount) || 0),
          0,
        ),
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

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleLeaveStatus = async (id, status) => {
    try {
      await API.patch(`/leaves/admin/status/${id}`, { status });
      toast.success(`Leave ${status} successfully`);
      fetchAdminData(); // Refresh list
    } catch (err) {
      toast.error("Failed to update leave status");
    }
  };

  /* ---------------- DOWNLOAD (CLOUDINARY URL) ---------------- */

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

  /* ---------------- FILTERED LEADS ---------------- */
  // const filteredLeads = leads.filter((lead) => {
  //   if (leadFilter === "PENDING") return lead.status === "NEW LEAD";
  //   if (leadFilter === "DISBURSED") return lead.status === "Disbursed";
  //   return true;
  // });

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCcw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black uppercase">
            Admin Command Center
          </h1>
          <button
            onClick={fetchAdminData}
            className="p-3 bg-gray-50 rounded-xl hover:text-blue-600"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {selectedClient ? (
          <ClientDetailView
            client={selectedClient}
            onBack={() => setSelectedClient(null)}
          />
        ) : activeView === "clients" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client._id}
                client={client}
                onView={() => setSelectedClient(client)} // Set the selected client here
              />
            ))}
          </div>
        ) : activeView === "dashboard" ? (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard
                label="Total Leads"
                value={stats.totalCount}
                icon={<FileText />}
              />

              <StatCard
                label="Leave Requests"
                value={leaves.filter((l) => l.status === "Pending").length}
                icon={<CalendarRange />}
                onClick={() => setActiveView("leaves")}
              />

              <StatCard
                label="Approvals"
                value={pendingUsers.length}
                icon={<UserPlus />}
                onClick={() => setActiveView("approvals")}
              />
              <StatCard
                label="Pending"
                value={stats.pendingCount}
                icon={<Clock />}
              />
              <StatCard
                label="Disbursed"
                value={stats.disbursedCount}
                icon={<CheckCircle />}
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
                color="green"
                onClick={() => setActiveView("attendance")}
              />
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 mb-6">
              {["ALL", "PENDING", "DISBURSED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setLeadFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-black ${
                    leadFilter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {f}
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
            </div>

            {/* TABLE */}
            <AdminLeadTable
              leads={leads}
              onUpdate={fetchAdminData}
              onDownload={handleDownload}
              onSelectLead={(lead) => setSelectedLead(lead)}
            />
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
const StatCard = ({ label, value, icon, dark }) => (
  <div
    className={`p-6 rounded-3xl border shadow-sm ${
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
