import React, { useEffect, useState } from "react";
import API from "../../api/axiosInstance";
import {
  FileText,
  CheckCircle,
  TrendingUp,
  IndianRupee,
  Clock,
  Search,
  Filter,
  Users,
  Target,
} from "lucide-react";
import AdminLeadTable from "../../components/AdminLeadTable";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    disbursedCount: 0,
    totalBusinessValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [targetProgress, setTargetProgress] = useState({}); // progress per client

  useEffect(() => {
    fetchAdminStats();
    fetchClients();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/leads/all");
      const allLeads = data.data;

      const pending = allLeads.filter((l) => l.status === "NEW LEAD").length;
      const disbursedLeads = allLeads.filter((l) => l.status === "Disbursed");
      const totalValue = disbursedLeads.reduce(
        (sum, lead) => sum + (Number(lead.loanAmount) || 0),
        0,
      );

      setLeads(allLeads);
      setStats({
        totalCount: allLeads.length,
        pendingCount: pending,
        disbursedCount: disbursedLeads.length,
        totalBusinessValue: totalValue,
      });
      toast.success("Admin stats updated");
    } catch (err) {
      toast.error("Failed to load admin stats");
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await API.get("/users/clients");
      setClients(data.data || []);
    } catch (err) {
      toast.error("Failed to load clients");
      console.error(err);
    }
  };

  const fetchTargetProgress = async (clientId) => {
    try {
      const { data } = await API.get("/targets/progress", {
        params: {
          clientId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });

      // store progress per client
      setTargetProgress((prev) => ({
        ...prev,
        [clientId]: {
          ...data,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      }));
    } catch (err) {
      toast.error("Failed to fetch target progress");
      console.error(err);
    }
  };

  const handleSetTarget = async (clientId, amount, month, year) => {
    try {
      await API.post("/targets/set", {
        client: clientId,
        targetAmount: Number(amount),
        month,
        year,
      });

      toast.success("Target set successfully!");

      // fetch updated progress for this client
      fetchTargetProgress(clientId);
    } catch (err) {
      toast.error("Failed to set target");
      console.error(err);
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.mobileNumber?.includes(searchTerm) ||
      lead.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 lg:p-8 space-y-8 bg-[#F8FAFF] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0A1D37] tracking-tight uppercase">
            Admin Command Center
          </h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">
            Sri Sri Associates • Business Intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <Clock className="text-blue-600" size={18} />
            <span className="text-xs font-black text-slate-700 uppercase">
              {new Date().toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Leads"
          value={stats.totalCount}
          icon={<FileText />}
          color="blue"
        />
        <StatCard
          label="Pending Review"
          value={stats.pendingCount}
          icon={<TrendingUp />}
          color="amber"
        />
        <StatCard
          label="Disbursements"
          value={stats.disbursedCount}
          icon={<CheckCircle />}
          color="green"
        />
        <StatCard
          label="Total Business"
          value={`₹${(stats.totalBusinessValue / 100000).toFixed(2)} Lacs`}
          icon={<IndianRupee />}
          color="indigo"
        />
      </div>

      {/* Quick Tools */}
      <div className="space-y-4 mt-6">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <span className="w-1 h-4 bg-slate-900 rounded-full"></span> Quick
          Tools
        </h3>
        <div className="bg-[#F6FAFF] border border-blue-100 rounded-3xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-x-auto">
          <ToolItem
            icon={<Users />}
            label="All Clients"
            onClick={() => setActiveView("clients")}
          />
          <ToolItem
            icon={<FileText />}
            label="All Leads"
            onClick={() => setActiveView("all-leads")}
          />
          <ToolItem
            icon={<TrendingUp />}
            label="Pending Leads"
            onClick={() => setActiveView("pending")}
          />
          <ToolItem
            icon={<Target />}
            label="Targets"
            onClick={() => setActiveView("targets")}
          />
          <ToolItem
            icon={<CheckCircle />}
            label="Disbursed"
            onClick={() => setActiveView("disbursed")}
          />
        </div>
      </div>

      {/* Dynamic Views */}
      {activeView !== "dashboard" && (
        <div className="animate-in slide-in-from-right duration-300 mt-6 w-full max-w-5xl mx-auto">
          <button
            onClick={() => setActiveView("dashboard")}
            className="mb-4 p-2 bg-gray-100 rounded-full"
          >
            Back
          </button>

          {/* Leads Table */}
          {["all-leads", "pending", "disbursed"].includes(activeView) && (
            <AdminLeadTable
              leads={
                activeView === "pending"
                  ? leads.filter((l) => l.status === "NEW LEAD")
                  : activeView === "disbursed"
                    ? leads.filter((l) => l.status === "Disbursed")
                    : leads
              }
              onUpdate={fetchAdminStats}
            />
          )}

          {/* Clients List */}
          {activeView === "clients" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((client) => (
                <div
                  key={client._id}
                  className="p-4 border rounded-xl bg-gray-50"
                >
                  <h4 className="font-bold">{client.name}</h4>
                  <p className="text-sm text-gray-600">Email: {client.email}</p>
                  <p className="text-sm text-gray-600">
                    Mobile: {client.mobileNumber}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Target Management */}
          {activeView === "targets" && (
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client._id}
                  className="p-4 border rounded-xl bg-gray-50"
                >
                  <h4 className="font-bold">{client.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <input
                      type="number"
                      placeholder="Target Amount"
                      className="py-1 px-2 border rounded-lg w-36 text-sm"
                      onChange={(e) =>
                        setTargetProgress((prev) => ({
                          ...prev,
                          [client._id]: {
                            ...prev[client._id],
                            targetAmount: e.target.value,
                          },
                        }))
                      }
                      value={targetProgress[client._id]?.targetAmount || ""}
                    />

                    <select
                      value={
                        targetProgress[client._id]?.month ||
                        new Date().getMonth() + 1
                      }
                      onChange={(e) =>
                        setTargetProgress((prev) => ({
                          ...prev,
                          [client._id]: {
                            ...prev[client._id],
                            month: Number(e.target.value),
                          },
                        }))
                      }
                      className="py-1 px-2 border rounded-lg text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("default", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Year"
                      value={
                        targetProgress[client._id]?.year ||
                        new Date().getFullYear()
                      }
                      onChange={(e) =>
                        setTargetProgress((prev) => ({
                          ...prev,
                          [client._id]: {
                            ...prev[client._id],
                            year: Number(e.target.value),
                          },
                        }))
                      }
                      className="py-1 px-2 border rounded-lg w-24 text-sm"
                    />

                    <button
                      onClick={() =>
                        handleSetTarget(
                          client._id,
                          targetProgress[client._id]?.targetAmount,
                          targetProgress[client._id]?.month,
                          targetProgress[client._id]?.year,
                        )
                      }
                      className="py-1 px-3 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Set Target
                    </button>

                    <button
                      onClick={() => fetchTargetProgress(client._id)}
                      className="py-1 px-3 bg-green-600 text-white rounded-lg text-sm"
                    >
                      View Progress
                    </button>
                  </div>

                  {targetProgress[client._id] && (
                    <div className="mt-2 text-sm space-y-1">
                      <div>
                        Target: ₹{targetProgress[client._id]?.targetAmount || 0}
                      </div>
                      <div>
                        Completed: ₹
                        {targetProgress[client._id]?.completedAmount || 0}
                      </div>
                      <div>
                        Remaining: ₹
                        {targetProgress[client._id]?.remainingAmount || 0}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* --- Subcomponents --- */
const StatCard = ({ label, value, icon, color }) => {
  const theme = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    green: "bg-green-50 text-green-700 border-green-100",
    indigo: "bg-[#0A1D37] text-white border-slate-800",
  };
  return (
    <div
      className={`p-6 rounded-4xl border shadow-sm flex items-center justify-between transition-all hover:translate-y-1 ${theme[color]}`}
    >
      <div>
        <p
          className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${color === "indigo" ? "text-blue-300" : "text-gray-400"}`}
        >
          {label}
        </p>
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      </div>
      <div
        className={`${color === "indigo" ? "bg-white/10" : "bg-white"} p-4 rounded-2xl shadow-inner`}
      >
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
  );
};

const ToolItem = ({ icon, label, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center gap-2 relative cursor-pointer active:scale-90"
  >
    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-gray-50 bg-white">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[9px] font-bold text-slate-700 text-center leading-[1.1] max-w-16.25">
      {label}
    </span>
  </div>
);

export default AdminDashboard;
