import React, { useContext, useState } from "react";
import API from "../api/axiosInstance";
import {
  X,
  Phone,
  User,
  FileText,
  CheckCircle2,
  Download,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ApplicationDetail = ({ lead, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [newExpiry, setNewExpiry] = useState("");

  const { user } = useContext(AuthContext);

  if (!lead) return null;

  const isExpired =
    lead.loanType === "Vehicle Insurance" &&
    lead.loanDetails?.endDate &&
    new Date(lead.loanDetails.endDate) < new Date();

  const statusOptions = [
    {
      label: "New Lead",
      value: "NEW LEAD",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Approved",
      value: "Approved",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Disbursed",
      value: "Disbursed",
      color: "bg-green-100 text-green-700",
    },
    { label: "Rejected", value: "Rejected", color: "bg-red-100 text-red-700" },
  ];

  const leadStatusOption = statusOptions.find(
    (opt) => opt.value === lead.status,
  );
  const badgeColor = leadStatusOption?.color || "bg-gray-100";

  const handleFileAction = (doc, mode = "preview") => {
    if (doc && doc.url) {
      let finalUrl = doc.url;

      if (mode === "download") {
        if (finalUrl.includes("upload/")) {
          finalUrl = finalUrl.replace("upload/", "upload/fl_attachment/");
        } else {
          window.open(doc.url, "_blank", "noopener,noreferrer");
        }
      }

      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("File not found");
    }
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

  const handleRenewPolicy = async () => {
    if (!newExpiry) {
      toast.error("Please select new expiry date");
      return;
    }

    try {
      setUpdating(true);
      await API.put(`/leads/admin-update/${lead._id}`, {
        loanDetails: {
          endDate: newExpiry,
        },
        status: "Approved",
      });

      toast.success("Insurance renewed successfully");
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to renew policy");
    } finally {
      setUpdating(false);
    }
  };

  const role = user?.role;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1D37]/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-[#F8FAFF] w-full max-w-2xl rounded-t-[2.5rem] md:rounded-4xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-white p-6 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={onClose}
            aria-label="Close modal"
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
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-full ${badgeColor}`}
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

          {/* Status Update Section */}
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

          {/* Dynamic Details Overview */}
          <div className="mx-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              {/* Common Fields for ALL Loans */}
              <DetailItem label="Customer Name" value={lead.customerName} />
              <DetailItem label="Mobile Number" value={lead.mobileNumber} />
              <DetailItem label="Mobile" value={lead.mobileNumber} />
              <DetailItem
                label="Required Amount"
                value={`₹${lead.loanAmount?.toLocaleString("en-IN")}`}
              />
              <DetailItem
                label="Loan ID"
                value={lead._id?.toString().slice(-6).toUpperCase()}
              />
              <DetailItem
                label="Document Type"
                value={lead.loanDetails?.docType || "N/A"}
              />

              {lead.loanType === "Vehicle Insurance" && (
                <>
                  {" "}
                  <DetailItem
                    label="Insurance Provider"
                    value={lead.loanDetails?.insuranceProvider || "N/A"}
                  />
                  <DetailItem
                    label="Policy Number"
                    value={lead.loanDetails?.policyNumber || "N/A"}
                  />
                  <DetailItem
                    label="Coverage Type"
                    value={lead.loanDetails?.coverageType || "N/A"}
                  />
                  <DetailItem
                    label="Start Date"
                    value={lead.loanDetails?.startDate || "N/A"}
                  />
                  <DetailItem
                    label="End Date"
                    value={lead.loanDetails?.endDate || "N/A"}
                  />
                  <div className="mx-5 mb-5 p-5 bg-emerald-600 rounded-3xl shadow-xl">
                    <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest text-center mb-4">
                      Insurance Renewal
                    </p>

                    {!renewing ? (
                      role === "ADMIN" ? (
                        <button
                          onClick={() => setRenewing(true)}
                          className="w-full py-3 bg-white text-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all"
                        >
                          Renew Policy
                        </button>
                      ) : null
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[9px] font-black text-emerald-100 uppercase mb-1">
                              New Expiry Date
                            </label>
                            <input
                              type="date"
                              value={newExpiry}
                              onChange={(e) => setNewExpiry(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setRenewing(false)}
                              className="flex-1 py-3 bg-white/20 text-white rounded-xl font-black text-xs uppercase"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={handleRenewPolicy}
                              disabled={updating}
                              className="flex-1 py-3 bg-white text-emerald-700 rounded-xl font-black text-xs uppercase hover:bg-emerald-50 disabled:opacity-60"
                            >
                              Confirm Renew
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest mt-4">
                            Current Expiry Date
                          </p>
                          <p className="text-xs font-black text-white uppercase">
                            {lead.loanDetails?.endDate
                              ? new Date(
                                  lead.loanDetails.endDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {(lead.loanType === "Home Loan" ||
                lead.loanType === "LAP Loan") && (
                <>
                  <DetailItem
                    label="Total Sq.Ft"
                    value={lead.loanDetails?.sqFt || "N/A"}
                  />
                  <DetailItem
                    label="Property Area"
                    value={lead.loanDetails?.area || "N/A"}
                  />
                  <DetailItem
                    label="Est. Market Value"
                    value={
                      lead.loanDetails?.houseValue
                        ? `₹${Number(lead.loanDetails.houseValue).toLocaleString("en-IN")}`
                        : "N/A"
                    }
                  />
                </>
              )}

              {lead.loanType === "Personal Loan" && (
                <>
                  <DetailItem
                    label="Income (M/A)"
                    value={lead.loanDetails?.income || "N/A"}
                  />
                  <DetailItem
                    label="Residence Status"
                    value={lead.loanDetails?.residence || "N/A"}
                  />
                </>
              )}

              {lead.loanType === "Business Loan" && (
                <>
                  <DetailItem
                    label="Income"
                    value={lead.loanDetails?.income || "N/A"}
                  />
                  <DetailItem
                    label="ITR/GST"
                    value={lead.loanDetails?.itr_gst || "N/A"}
                  />
                </>
              )}

              {lead.loanType === "Other Loan Types" && (
                <div className="col-span-2">
                  <DetailItem
                    label="Loan Description"
                    value={lead.loanDetails?.additionalDetails}
                  />
                </div>
              )}

              {/* Always show Remarks if they exist */}
              <div className="col-span-2">
                <DetailItem
                  label="Additional Remarks"
                  value={lead.remarks || "No remarks provided"}
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mx-5 mt-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 px-2">
              Attached Documents ({lead.documents?.length || 0})
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {lead.documents && lead.documents.length > 0 ? (
                lead.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText size={16} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 truncate max-w-[180px]">
                        {doc.fileName || `Document ${index + 1}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {/* PREVIEW BUTTON */}
                      <button
                        onClick={() => handleFileAction(doc, "preview")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-2 bg-white text-blue-600 text-[11px] font-bold rounded-xl border border-blue-100 hover:bg-blue-50 transition-all"
                      >
                        <Eye size={14} /> Preview
                      </button>

                      {/* DOWNLOAD BUTTON */}
                      <button
                        onClick={() => handleFileAction(doc, "download")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-2 bg-blue-600 text-white text-[11px] font-bold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all"
                      >
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 italic">
                  No documents uploaded
                </p>
              )}
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
