import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { 
  ArrowLeft, Phone, User, FileText, Download, 
  MapPin, Landmark, Car, ShieldCheck, Clipboard 
} from 'lucide-react';
import toast from 'react-hot-toast';

const LeadDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { data } = await API.get(`/leads/${id}`);
        setLead(data.data);
        toast.success("Application details loaded");
      } catch (err) {
        toast.error("Error fetching application details");
        console.error("Error fetching lead details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Loading Application...</div>;
  if (!lead) return <div className="p-20 text-center">Lead not found.</div>;

  // Important: Convert Mongoose Map to a standard JS Object for easier access
  const details = lead.loanDetails || {};

  const renderTypeSpecificDetails = () => {
    switch (lead.loanType) {
      case "Home Loan":
      case "LAP Loan":
        return (
          <>
            <InfoBox label="Property Type" value={details.documentType} icon={<Landmark size={14}/>} />
            <InfoBox label="Area Size" value={details.sqFt ? `${details.sqFt} Sq. Ft` : '—'} icon={<MapPin size={14}/>} />
            <InfoBox label="Location" value={details.area} />
            <InfoBox label="Market Value" value={details.houseValue ? `₹${Number(details.houseValue).toLocaleString('en-IN')}` : '—'} />
          </>
        );
      case "Personal Loan":
        return (
          <>
            <InfoBox label="ID Proof Type" value={details.documentType} />
            <InfoBox label="Monthly Income" value={details.income ? `₹${Number(details.income).toLocaleString('en-IN')}` : '—'} />
            <div className="col-span-2">
              <InfoBox label="Residence Address" value={details.residence} />
            </div>
          </>
        );
      case "Business Loan":
        return (
          <>
            <InfoBox label="Business Type" value={details.businessType} />
            <InfoBox label="Annual Turnover" value={details.income ? `₹${Number(details.income).toLocaleString('en-IN')}` : '—'} />
            <InfoBox label="ITR/GST" value={details.hasITR?.toUpperCase()} />
            <InfoBox label="Labour License" value={details.hasLabourLicense?.toUpperCase()} />
            <InfoBox label="Business Address" value={details.residence} />
          </>
        );
      case "Vehicle Loan":
        return (
          <>
            <InfoBox label="Vehicle Category" value={details.vehicleType} icon={<Car size={14}/>} />
            <InfoBox label="Model & Year" value={details.vehicleModel} />
            <InfoBox label="Vehicle Number" value={details.vehicleNumber} />
            <InfoBox label="Agriculture Use" value={details.isAgriculture?.toUpperCase()} />
          </>
        );
      default:
        return <p className="text-xs text-gray-400">Standard lead details apply.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-20">
      {/* Header */}
      <div className="bg-white p-6 sticky top-0 z-30 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft size={24} className="text-slate-800" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Application Detail</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{lead.loanType}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-4xl flex items-center justify-center text-white text-3xl font-black uppercase">
              {lead.customerName?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 uppercase">{lead.customerName}</h2>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Lead ID: {lead._id.slice(-8).toUpperCase()}</p>
              <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                <User size={12} className="text-blue-500" /> Agent: {lead.client?.name || 'In-House'}
              </p>
            </div>
          </div>
          <a href={`tel:${lead.mobileNumber}`} className="flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 hover:scale-105 transition">
            <Phone size={18} fill="white" /> Call Customer
          </a>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Clipboard className="text-blue-600" size={18} />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Loan Requirements</h4>
              </div>
              <div className="grid grid-cols-2 gap-y-10">
                <InfoBox label="Mobile Number" value={lead.mobileNumber} />
                <InfoBox label="Requested Amount" value={lead.loanAmount ? `₹${Number(lead.loanAmount).toLocaleString('en-IN')}` : '—'} color="text-blue-600" />
                {renderTypeSpecificDetails()}
              </div>
            </div>

            {/* Handle both field names used in your logic */}
            {(lead.loanDetails?.moreDetails || lead.remarks) && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Additional Remarks</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-gray-50 p-6 rounded-2xl italic">
                  "{lead.loanDetails?.moreDetails || lead.remarks}"
                </p>
              </div>
            )}
          </div>

          {/* Documents Sidebar */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-8">
              <ShieldCheck className="text-purple-600" size={18} />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Documents</h4>
            </div>
            <div className="space-y-3">
              {lead.documents && lead.documents.length > 0 ? (
                lead.documents.map((doc, idx) => (
                  <DocLink key={idx} name={doc.fileName || `Document ${idx + 1}`} url={doc.url} />
                ))
              ) : (
                <p className="text-center py-10 text-[10px] font-black text-gray-300 uppercase">No Files Found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, icon, color = "text-slate-800" }) => (
  <div>
    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">{label}</p>
    <div className="flex items-center gap-2">
      {icon && <span className="text-blue-500">{icon}</span>}
      <p className={`text-sm font-black uppercase ${color}`}>{value || '—'}</p>
    </div>
  </div>
);

const DocLink = ({ name, url }) => (
  <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-slate-900 transition-all">
    <div className="flex items-center gap-3">
      <FileText size={18} className="text-gray-400 group-hover:text-blue-400" />
      <span className="text-[10px] font-black text-gray-500 group-hover:text-white uppercase truncate max-w-30">{name}</span>
    </div>
    <Download size={16} className="text-gray-400 group-hover:text-white" />
  </a>
);

const StatusBadge = ({ status }) => {
  const colors = {
    'NEW LEAD': 'bg-amber-100 text-amber-700 border-amber-200',
    'Approved': 'bg-blue-100 text-blue-700 border-blue-200',
    'Disbursed': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

export default LeadDetailsView;