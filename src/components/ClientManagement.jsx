import React, { useEffect, useState, useCallback } from "react";
import API from "../api/axiosInstance";
import {
  Users,
  Target,
  Search,
  RefreshCcw,
  TrendingUp,
  Mail,
  Calendar,
  IndianRupee,
  X,
  CheckCircle2,
  XCircle,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");
const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AVATAR_COLORS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
  "from-teal-500 to-teal-700",
  "from-indigo-500 to-indigo-700",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[
    [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

// ── Agent Card ────────────────────────────────────────────────────────────────
const AgentCard = ({ client, index, onSetTarget }) => {
  const [progress, setProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    API.get(`/targets/progress/${client._id}`)
      .then(({ data }) => setProgress(data))
      .catch(() => setProgress(null))
      .finally(() => setLoadingProgress(false));
  }, [client._id]);

  const pct =
    progress?.targetAmount > 0
      ? Math.min(
          Math.round((progress.completedAmount / progress.targetAmount) * 100),
          100
        )
      : 0;

  const isApproved = client.isApproved !== false;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Top accent bar */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          isApproved ? "from-blue-500 to-indigo-500" : "from-red-400 to-red-500"
        }`}
      />

      <div className="p-6">
        {/* Avatar + Name Row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColor(
                client.name
              )} flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0`}
            >
              {initials(client.name)}
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight leading-tight">
                {client.name}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 flex items-center gap-1">
                <Mail size={10} /> {client.email}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 flex items-center gap-1">
                <Calendar size={10} />{" "}
                Joined{" "}
                {new Date(client.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
              isApproved
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 size={10} />
            ) : (
              <XCircle size={10} />
            )}
            {isApproved ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Target Progress */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Target size={10} /> Monthly Target
            </span>
            <span
              className={`text-[10px] font-black uppercase ${
                pct >= 100
                  ? "text-green-600"
                  : pct >= 50
                  ? "text-blue-600"
                  : "text-orange-500"
              }`}
            >
              {loadingProgress ? "…" : `${pct}%`}
            </span>
          </div>

          {loadingProgress ? (
            <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
          ) : (
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  pct >= 100
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : pct >= 50
                    ? "bg-gradient-to-r from-blue-400 to-blue-600"
                    : "bg-gradient-to-r from-orange-400 to-orange-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}

          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-bold text-gray-400">
              Achieved:{" "}
              <span className="text-slate-700">
                {loadingProgress ? "—" : fmt(progress?.completedAmount)}
              </span>
            </span>
            <span className="text-[10px] font-bold text-gray-400">
              Goal:{" "}
              <span className="text-slate-700">
                {loadingProgress
                  ? "—"
                  : progress?.targetAmount
                  ? fmt(progress.targetAmount)
                  : "Not Set"}
              </span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSetTarget(client)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-blue-100"
        >
          <IndianRupee size={13} /> Set Monthly Target
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/users/clients");
      setClients(data.data || []);
    } catch (err) {
      console.error("Error fetching clients", err);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSetTarget = async (e) => {
    e.preventDefault();
    if (!targetAmount || Number(targetAmount) <= 0)
      return toast.error("Enter a valid target amount");

    setSubmitting(true);
    const now = new Date();
    try {
      await API.post("/targets/set", {
        client: selectedClient._id,
        targetAmount: Number(targetAmount),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      toast.success(`Target set for ${selectedClient.name}!`);
      setSelectedClient(null);
      setTargetAmount("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error setting target");
      console.error("Set target failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <RefreshCcw className="animate-spin text-blue-500" size={28} />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
          Loading Agents…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Users className="text-white" size={16} />
            </div>
            Field Agents
          </h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 ml-11">
            {clients.length} registered agent{clients.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search agents…"
              value={searchTerm}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all w-52"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchClients}
            className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all"
            title="Refresh"
          >
            <RefreshCcw size={15} />
          </button>
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Total Agents",
            value: clients.length,
            icon: <Users size={15} />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Active",
            value: clients.filter((c) => c.isApproved !== false).length,
            icon: <CheckCircle2 size={15} />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "This Month",
            value: new Date().toLocaleString("en-IN", { month: "long" }),
            icon: <Calendar size={15} />,
            color: "text-purple-600 bg-purple-50",
          },
        ].map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm"
          >
            <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                {label}
              </p>
              <p className="text-sm font-black text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Agent Grid ── */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center">
          <Users size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {searchTerm ? "No agents match your search" : "No agents registered yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client, i) => (
            <AgentCard
              key={client._id}
              client={client}
              index={i}
              onSetTarget={setSelectedClient}
            />
          ))}
        </div>
      )}

      {/* ── Set Target Modal ── */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(
                    selectedClient.name
                  )} flex items-center justify-center text-white font-black text-sm`}
                >
                  {initials(selectedClient.name)}
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">
                    Set Monthly Target
                  </p>
                  <h3 className="text-white font-black text-sm uppercase">
                    {selectedClient.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => { setSelectedClient(null); setTargetAmount(""); }}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSetTarget} className="p-6 space-y-5">
              <div className="bg-blue-50 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                <p className="text-xs font-bold text-blue-700">
                  Target for{" "}
                  <span className="font-black">
                    {new Date().toLocaleString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Target Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-black text-slate-900 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 5000000"
                  />
                </div>
                {targetAmount && (
                  <p className="text-[10px] font-bold text-blue-600 mt-1.5 ml-1">
                    = {fmt(targetAmount)}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setSelectedClient(null); setTargetAmount(""); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 active:scale-95 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCcw size={14} className="animate-spin" />
                  ) : (
                    <TrendingUp size={14} />
                  )}
                  {submitting ? "Saving…" : "Save Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
