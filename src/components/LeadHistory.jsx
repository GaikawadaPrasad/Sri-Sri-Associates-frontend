import React from "react";
import { 
  FileText, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight 
} from "lucide-react";
import toast from "react-hot-toast";

const LeadHistory = ({ leads, onLeadClick, onEditClick }) => {
  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">No Leads Found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead._id}
            className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onLeadClick(lead)}
          >
            <div className="flex items-center justify-between">
              {/* Left: Lead Info */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  lead.isFinished ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}>
                  {lead.isFinished ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                
                <div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-tight">
                    {lead.customerName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase">
                      {lead.loanType}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">
                      ₹{Number(lead.loanAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Status & Actions */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end mr-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    lead.status === "Disbursed" ? "bg-green-100 text-green-700" : 
                    lead.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {lead.status}
                  </span>
                  {!lead.isFinished && (
                    <span className="text-[8px] font-bold text-red-500 uppercase mt-1">
                      Action Required
                    </span>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents opening the Detail Modal
                    if(lead.status === "Disbursed") {
                      toast.error("Disbursed leads cannot be edited");
                      return;
                    };
                    onEditClick(lead);
                    toast.success("Editing lead details");
                  }}
                  className="p-2.5 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-95"
                  title="Edit Lead"
                >
                  <Edit3 size={18} />
                </button>

                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadHistory;