import React from "react";
import {
  User,
  IndianRupee,
  ChevronDown,
  ArrowUpRight,
  FileText,
  Trash2,
} from "lucide-react";

import API from "../api/axiosInstance";
import toast from "react-hot-toast";

const AdminLeadTable = ({
  leads,
  onUpdate,
  onSelectLead,
  onDownload,
  onDelete,
}) => {
  const statusOptions = ["NEW LEAD", "Approved", "Disbursed", "Rejected"];

  const handleStatusChange = async (e, leadId, newStatus) => {
    e.stopPropagation();
    try {
      await API.patch(`/leads/${leadId}/status`, { status: newStatus });
      if (onUpdate) onUpdate();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50">
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Customer Details
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
              Loan Type
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
              Amount
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
              Status
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
              Documents / Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map((lead) => (
            <tr
              key={lead._id}
              onClick={() => onSelectLead(lead)}
              className="group hover:bg-blue-50/30 transition-all cursor-pointer"
            >
              {/* CUSTOMER INFO */}
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">
                      {lead.customerName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">
                      {lead.mobileNumber}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(lead._id);
                    }}
                    className="p-2 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete Lead"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>

              {/* LOAN TYPE */}
              <td className="px-6 py-6 text-center">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">
                  {lead.loanType}
                </span>
              </td>

              {/* AMOUNT */}
              <td className="px-6 py-6 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-900">
                  <IndianRupee size={12} className="text-gray-400" />
                  <span className="text-xs font-black">
                    {lead.loanAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </td>

              {/* STATUS DROPDOWN */}
              <td className="px-6 py-6 text-center">
                <div className="relative inline-block">
                  <select
                    value={lead.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleStatusChange(e, lead._id, e.target.value)
                    }
                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[9px] font-black uppercase border cursor-pointer focus:outline-none transition-all ${StatusStyles(
                      lead.status,
                    )}`}
                  >
                    {statusOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-white text-slate-900"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                  />
                </div>
              </td>

              {/* DOCUMENTS & VIEW */}
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-4">
                  {lead.documents && lead.documents.length > 0 ? (
                    <div className="flex -space-x-2">
                      {lead.documents.slice(0, 3).map((doc, i) => (
                        <button
                          key={i}
                          title={doc.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(doc.url, doc.name);
                          }}
                          className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-blue-500 shadow-sm hover:bg-blue-50"
                        >
                          <FileText size={14} />
                        </button>
                      ))}

                      {lead.documents.length > 3 && (
                        <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-[8px] font-black text-gray-400">
                          +{lead.documents.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[8px] font-black text-gray-300 uppercase">
                      No Files
                    </span>
                  )}

                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowUpRight size={16} />
                  </div>
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

const StatusStyles = (status) => {
  const styles = {
    "NEW LEAD":
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    Approved: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    Disbursed: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    Rejected: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  };
  return styles[status] || "bg-gray-50 text-gray-600 border-gray-200";
};

export default AdminLeadTable;
