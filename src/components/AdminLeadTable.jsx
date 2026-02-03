import React from "react";
import {
  User,
  IndianRupee,
  ChevronDown,
  ArrowUpRight,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminLeadTable = ({ leads, onUpdate, onDownload = () => {} }) => {
  const navigate = useNavigate();
  const statusOptions = ["NEW LEAD", "Approved", "Disbursed", "Rejected"];

  const handleStatusChange = async (e, leadId, newStatus) => {
    e.stopPropagation(); // prevent row click
    try {
      await fetch(`/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (onUpdate) onUpdate();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50">
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Customer & Agent
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Loan Information
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Status
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {leads.map((lead) => (
            <tr
              key={lead._id}
              className="group cursor-pointer hover:bg-blue-50/40 transition-all"
              onClick={() => navigate(`/admin/lead/${lead._id}`)}
            >
              {/* CUSTOMER */}
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {lead.customerName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 uppercase text-sm">
                      {lead.customerName}
                    </p>
                    <p className="text-[10px] text-blue-500 font-bold flex items-center gap-1 uppercase tracking-tighter mt-0.5">
                      <User size={10} /> {lead.client?.name || "In-House"}
                    </p>
                  </div>
                </div>
              </td>

              {/* LOAN */}
              <td className="px-8 py-6">
                <p className="text-sm font-black text-slate-800 flex items-center gap-1">
                  <IndianRupee size={14} className="text-gray-400" />
                  {lead.loanAmount?.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                  {lead.loanType}
                </p>
              </td>

              {/* STATUS */}
              <td className="px-8 py-6">
                <StatusBadge status={lead.status} />
              </td>

              {/* ACTIONS */}
              <td className="px-8 py-6 text-right">
                <div
                  className="flex items-center justify-end gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* STATUS DROPDOWN */}
                  <div className="relative inline-block">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(e, lead._id, e.target.value)
                      }
                      className="appearance-none bg-white border border-gray-200 text-slate-700 py-1.5 px-4 pr-10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-300 transition-all"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={12}
                    />
                  </div>

                  {/* DOWNLOAD */}
                  {lead.documents && lead.documents.length > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(lead.documents[0].filename);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:underline text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  ) : (
                    <span className="text-[9px] text-gray-400 uppercase">
                      No File
                    </span>
                  )}

                  {/* VIEW */}
                  <ArrowUpRight
                    size={18}
                    className="text-gray-300 group-hover:text-blue-600 transition-colors"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {leads.length === 0 && (
        <div className="p-20 text-center">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            No matching leads found
          </p>
        </div>
      )}
    </div>
  );
};

/* STATUS BADGE */
const StatusBadge = ({ status }) => {
  const styles = {
    "NEW LEAD": "bg-amber-100 text-amber-700 border-amber-200",
    Approved: "bg-blue-100 text-blue-700 border-blue-200",
    Disbursed: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default AdminLeadTable;
