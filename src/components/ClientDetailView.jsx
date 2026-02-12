import React, { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Target,
  Clock,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

const ClientDetailView = ({ client, onBack , onDelete }) => {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    disbursed: 0,
    rejected: 0,
    pending: 0,
  });
  const [attendance, setAttendance] = useState([]);
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDeepDetails = async () => {
      try {
        setLoading(true);
        // Fetch all specific data for this one client
        const [leadsRes, attRes, targetRes] = await Promise.all([
          API.get(`/leads/client/${client._id}`),
          API.get(`/attendance/client/${client._id}`),
          API.get(`/targets/progress/${client._id}`),
        ]);

        const leads = leadsRes.data.data;
        setStats({
          total: leads.length,
          approved: leads.filter((l) => l.status === "Approved").length,
          disbursed: leads.filter((l) => l.status === "Disbursed").length,
          rejected: leads.filter((l) => l.status === "Rejected").length,
          pending: leads.filter((l) => l.status === "Pending").length,
        });
        setAttendance(attRes.data.data);
        setTarget(targetRes.data);
      } catch (err) {
        toast.error("Error fetching agent details");
      } finally {
        setLoading(false);
      }
    };
    fetchClientDeepDetails();
  }, [client._id]);

  if (loading)
    return (
      <div className="p-20 text-center font-black animate-pulse">
        LOADING AGENT PROFILE...
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-900 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-900">
            {client.name}
          </h2>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            Agent ID: {client._id.slice(-6)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Profile & Stats */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mb-4 shadow-lg shadow-blue-200">
                {client.name.charAt(0)}
              </div>
              <h3 className="font-black text-slate-900 uppercase">
                {client.name}
              </h3>
              <p className="text-xs text-gray-400 font-bold">{client.email}</p>
            </div>

            <button onClick={() => onDelete(client._id)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              Delete Agent
            </button>

            <div className="space-y-3">
              <StatRow
                label="Total Leads"
                value={stats.total}
                icon={<FileText size={14} />}
                color="blue"
              />
              <StatRow
                label="Disbursed"
                value={stats.disbursed}
                icon={<CheckCircle size={14} />}
                color="green"
              />
              <StatRow
                label="Rejected"
                value={stats.rejected}
                icon={<XCircle size={14} />}
                color="red"
              />
              <StatRow
                label="Pending"
                value={stats.pending}
                icon={<Clock size={14} />}
                color="yellow"
              />
            </div>
          </div>

          {/* Monthly Target Card */}
          <div className="bg-[#0A1D37] p-8 rounded-[40px] text-white shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-blue-400" />
              <h4 className="text-xs font-black uppercase tracking-widest">
                Monthly Target
              </h4>
            </div>
            {target ? (
              <>
                <p className="text-[18px] font-bold text-gray-300 uppercase mb-4">
                  Goal: ₹{target.targetAmount?.toLocaleString()}
                </p>
                <div className="text-xl font-black mb-2">
                 Completed: ₹{target.completedAmount?.toLocaleString()}
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(target.completedAmount / target.targetAmount) * 100}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500 italic">
                No target set for this month
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Attendance History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-scroll h-full">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase flex items-center gap-2">
                <Clock className="text-blue-600" size={18} /> Attendance History
              </h3>
            </div>
            <div className="overflow-y-auto max-h-150">
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-4 text-[9px] font-black uppercase text-gray-400 pl-8">
                      Date
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase text-gray-400">
                      In
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase text-gray-400">
                      Out
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendance.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 pl-8 text-xs font-bold text-slate-700">
                        {new Date(log.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="p-4 text-xs font-black text-slate-900">
                        {new Date(log.punchIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-xs font-black text-slate-900">
                        {log.punchOut
                          ? new Date(log.punchOut).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${log.status === "IN" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && (
                <div className="p-20 text-center text-gray-400 text-xs font-bold uppercase">
                  No records found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, icon, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    red: "text-red-600 bg-red-50",
  };
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl border border-gray-50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-[10px] font-black text-gray-400 uppercase">
          {label}
        </span>
      </div>
      <span className="font-black text-slate-900">{value}</span>
    </div>
  );
};

export default ClientDetailView;
