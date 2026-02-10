import React from "react";
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  User,
  Briefcase,
  Car,
  ShieldCheck,
  Layers,
  Edit3,
} from "lucide-react";

const LeadHistory = ({ leads, onLeadClick, onEditClick }) => {
  const getLoanTypeConfig = (type) => {
    switch (type) {
      case "Home Loan":
      case "LAP Loan":
        return {
          icon: <Home size={16} />,
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
      case "Personal Loan":
        return {
          icon: <User size={16} />,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        };
      case "Business Loan":
        return {
          icon: <Briefcase size={16} />,
          color: "text-purple-600",
          bg: "bg-purple-50",
        };
      case "Vehicle Loan":
        return {
          icon: <Car size={16} />,
          color: "text-orange-600",
          bg: "bg-orange-50",
        };
      case "Vehicle Insurance":
        return {
          icon: <ShieldCheck size={16} />,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        };
      default:
        return {
          icon: <Layers size={16} />,
          color: "text-slate-600",
          bg: "bg-slate-50",
        };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Disbursed":
      case "Approved":
        return "bg-green-50 text-green-700 border-green-100";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="p-20 text-center">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
          No applications found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Client & Category
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Amount / Details
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Status
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map((lead) => {
            const config = getLoanTypeConfig(lead.loanType);
            return (
              <tr
                key={lead._id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {lead.customerName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          {lead.loanType}
                        </span>
                        {lead.loanDetails?.vehicleNumber && (
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 rounded">
                            {lead.loanDetails.vehicleNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-black text-slate-700">
                    ₹{lead.loanAmount?.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    {lead.isFinished
                      ? "Documentation Complete"
                      : "Missing Documents"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(lead.status)}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditClick(lead)}
                      className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onLeadClick(lead)}
                      className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-slate-900 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeadHistory;
