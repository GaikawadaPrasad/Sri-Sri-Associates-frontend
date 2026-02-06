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
} from "lucide-react";
import AdminLeadTable from "../../components/AdminLeadTable";
import TargetView from "../../components/TargetView";
import toast from "react-hot-toast";
import ApplicationDetail from "../../components/ApplicationDetail";

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [leadFilter, setLeadFilter] = useState("ALL"); // ALL | PENDING | DISBURSED
  const [selectedLead, setSelectedLead] = useState(null);

  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    disbursedCount: 0,
    totalBusinessValue: 0,
  });

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsRes, clientsRes] = await Promise.all([
        API.get("/leads/all"),
        API.get("/users/clients"),
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
    } catch (err) {
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

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
  const filteredLeads = leads.filter((lead) => {
    if (leadFilter === "PENDING") return lead.status === "NEW LEAD";
    if (leadFilter === "DISBURSED") return lead.status === "Disbursed";
    return true;
  });

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
        {activeView === "dashboard" ? (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard
                label="Total Leads"
                value={stats.totalCount}
                icon={<FileText />}
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
