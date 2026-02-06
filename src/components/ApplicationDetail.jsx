import React, { useState } from "react";
import API from "../api/axiosInstance";
import { X, Phone, User, FileText, CheckCircle2, Download } from "lucide-react";
import toast from "react-hot-toast";

const ApplicationDetail = ({ lead, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);

  if (!lead) return null;

  const statusOptions = [
    { label: "New Lead", value: "NEW LEAD", color: "bg-amber-100 text-amber-700" },
    { label: "Approved", value: "Approved", color: "bg-blue-100 text-blue-700" },
    { label: "Disbursed", value: "Disbursed", color: "bg-green-100 text-green-700" },
    { label: "Rejected", value: "Rejected", color: "bg-red-100 text-red-700" },
  ];

  // ✅ Updated download function: direct download from Cloudinary
  const handleDownload = (url, name) => {
    if (!url) return toast.error("No file URL found");

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name || "file.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Download started");
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await API.patch(`/leads/${lead._id}/status`, { status: newStatus });
      if (onUpdate) onUpdate();
      onClose();
      toast.success("Status updated");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1D37]/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-[#F8FAFF] w-full max-w-2xl rounded-t-[2.5rem] md:rounded-4xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-white p-6 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
          <h2 className="text-sm font-black text-[#0A1D37] uppercase tracking-widest">
            Application Details
          </h2>
          <div className="w-10"></div>
        </div>

        <div className="overflow-y-auto flex-1 pb-10">
          {/* Profile Section */}
          <div className="m-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-50/50">
                <User className="text-blue-600" size={30} />
              </div>
              <div className="flex-1">
                <span
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-full ${
                    statusOptions.find((opt) => opt.value === lead.status)?.color || "bg-gray-100"
                  }`}
                >
                  {lead.status === "NEW LEAD" ? "New Lead" : lead.status}
                </span>
                <h3 className="text-lg font-black text-gray-900 uppercase mt-1">
                  {lead.customerName}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  ID - {lead._id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <a
                href={`tel:${lead.mobileNumber}`}
                className="bg-green-500 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition"
              >
                <Phone size={20} fill="currentColor" />
              </a>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="mx-5 mb-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Documents
            </h4>
            {lead.documents && lead.documents.length > 0 ? (
              <div className="space-y-2">
                {lead.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-600 truncate max-w-[180px]">
                          {doc.name || `Document ${index + 1}`}
                        </p>
                        <p className="text-[8px] text-gray-400 font-medium">
                          {doc.uploadedAt
                            ? new Date(doc.uploadedAt).toLocaleDateString()
                            : "Recently Uploaded"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(doc.url, doc.name)}
                      className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95"
                      title="View/Download"
                    >
                      <Download size={14} />
                    </button>
                  </div>    
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-[10px] font-bold text-gray-400 uppercase">
                No documents found
              </p>
            )}
          </div>

          {/* Status Update */}
          <div className="mx-5 mb-5 p-5 bg-slate-900 rounded-3xl shadow-xl">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest text-center mb-4">
              Admin Controls
            </p>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  disabled={updating}
                  onClick={() => handleStatusChange(option.value)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                    lead.status === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {lead.status === option.value && <CheckCircle2 size={12} />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Details Overview */}
          <div className="mx-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <DetailItem label="Loan Type" value={lead.loanType} />
              <DetailItem
                label="Amount"
                value={`₹${lead.loanAmount?.toLocaleString("en-IN")}`}
              />
              <DetailItem label="PAN" value={lead.panNumber} />
              <DetailItem
                label="District"
                value={lead.loanDetails?.district || lead.district}
              />
              <DetailItem
                label="State"
                value={lead.loanDetails?.state || lead.state}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="border-b border-gray-50 pb-2">
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">
      {label}
    </p>
    <p className="text-xs font-black text-gray-800 uppercase truncate">
      {value || "—"}
    </p>
  </div>
);

export default ApplicationDetail;
