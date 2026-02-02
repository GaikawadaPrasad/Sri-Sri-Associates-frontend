import React, { useState } from 'react';
import API from '../api/axiosInstance';
import { X, Phone, User, FileText, CheckCircle2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast'; 

const ApplicationDetail = ({ lead, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);

  if (!lead) return null;

  const statusOptions = [
    { label: "Pending", value: "Pending", color: "bg-amber-100 text-amber-700" },
    { label: "Approved", value: "Approved", color: "bg-blue-100 text-blue-700" },
    { label: "Disbursed", value: "Disbursed", color: "bg-green-100 text-green-700" },
    { label: "Rejected", value: "Rejected", color: "bg-red-100 text-red-700" }
  ];

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      // Backend call to update status
      await API.patch(`/leads/${lead._id}/status`, { status: newStatus });
      
     
      
      // Refresh the data in AdminDashboard
      if (onUpdate) onUpdate(); 
      onClose();

    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#0A1D37]/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-[#F8FAFF] w-full max-w-2xl rounded-t-[2.5rem] md:rounded-4xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-white p-6 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} className="text-gray-500" />
          </button>
          <h2 className="text-sm font-black text-[#0A1D37] uppercase tracking-widest">Application Details</h2>
          <div className="w-10"></div>
        </div>

        <div className="overflow-y-auto flex-1 pb-10">
          {/* Profile Card (Matching Image) */}
          <div className="m-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-50">
                <User className="text-amber-600" size={30} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full ${
                    statusOptions.find(opt => opt.value === (lead.status === 'NEW LEAD' ? 'Pending' : lead.status))?.color || 'bg-gray-100'
                  }`}>
                    {lead.status === 'NEW LEAD' ? 'Pending' : lead.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase leading-tight">
                  {lead.customerName}
                </h3> 
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID - {lead._id?.slice(-8).toUpperCase()}</p>
              </div>
              <a href={`tel:${lead.mobileNumber}`} className="bg-green-500 text-white p-3 rounded-2xl shadow-lg shadow-green-100 active:scale-90 transition">
                <Phone size={20} fill="currentColor" />
              </a>
            </div>
          </div>

          {/* ADMIN ACTION: Status Dropdown */}
          <div className="mx-5 mb-5 p-5 bg-blue-50 rounded-3xl border border-blue-100">
            <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest block mb-3 text-center">Update Application Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  disabled={updating}
                  onClick={() => handleStatusChange(option.value)}
                  className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                    lead.status === option.value 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-blue-100'
                  }`}
                >
                  {lead.status === option.value && <CheckCircle2 size={12} />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Details Grid (Matching Image) */}
          <div className="mx-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-blue-600 pl-3">
              <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Client Overview</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <DetailItem label="Full Name" value={lead.customerName} />
              <DetailItem label="Mobile" value={lead.mobileNumber} />
              <DetailItem label="Loan Amount" value={`₹${lead.loanAmount?.toLocaleString('en-IN')}`} />
              <DetailItem label="Brand" value={lead.vehicleBrand} />
              <DetailItem label="Model" value={lead.vehicleModel} />
              <DetailItem label="Year" value={lead.vehicleYear} />
              <DetailItem label="State" value={lead.state} />
              <DetailItem label="District" value={lead.district} />
              <DetailItem label="PAN Number" value={lead.panNumber || 'NOT PROVIDED'} />
              <DetailItem label="Registration" value={lead.registrationNumber || 'N/A'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="border-b border-gray-50 pb-2">
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{label}</p>
    <p className="text-xs font-black text-gray-800 uppercase truncate">{value || '—'}</p>
  </div>
);

export default ApplicationDetail;