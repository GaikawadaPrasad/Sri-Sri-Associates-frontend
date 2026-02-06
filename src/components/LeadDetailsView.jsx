import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { 
  ArrowLeft, Phone, User, FileText, Download, 
  MapPin, Landmark, Car, ShieldCheck, Clipboard,
  Calendar, IndianRupee, ExternalLink
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
      } catch (err) {
        toast.error("Error fetching application details");
        console.error("Error fetching lead details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Clipboard className="text-blue-600 animate-bounce" size={24} />
        </div>
        <p className="font-black uppercase tracking-widest text-slate-400 text-xs">Loading Application...</p>
      </div>
    </div>
  );

  if (!lead) return <div className="p-20 text-center">Lead not found.</div>;

  // Since we use Cloudinary, documents now have a direct 'url' property
  const documents = lead.documents || [];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-slate-900 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Primary Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                    {lead.customerName}
                  </h1>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{lead.loanType}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => copyToClipboard(lead.mobileNumber)}
                  className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all flex items-center gap-3"
                >
                  <Phone size={18} />
                  <span className="font-black text-xs uppercase">{lead.mobileNumber}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6 border-t border-gray-50 pt-10">
              <InfoBox label="Loan Amount" value={`₹${lead.loanAmount?.toLocaleString('en-IN')}`} icon={<IndianRupee size={16}/>} color="text-blue-600" />
              <InfoBox label="Application ID" value={lead._id.slice(-8).toUpperCase()} icon={<Clipboard size={16}/>} />
              <InfoBox label="Date Submitted" value={new Date(lead.createdAt).toLocaleDateString()} icon={<Calendar size={16}/>} />
              
              {/* Dynamic Loan Details based on Backend Map */}
              {Object.entries(lead.loanDetails || {}).map(([key, val]) => (
                <InfoBox 
                  key={key} 
                  label={key.replace(/([A-Z])/g, ' $1').trim()} 
                  value={val} 
                  icon={<ShieldCheck size={16}/>} 
                />
              ))}
            </div>
          </section>

          {/* Document Section */}
          <section>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Verified Documents</h2>
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc, idx) => (
                  <DocLink key={idx} name={doc.name} url={doc.url} />
                ))}
              </div>
            ) : (
              <div className="p-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase">No documents uploaded for this application</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sidebar Stats/Info */}
        <div className="space-y-6">
          <div className="bg-[#0A1D37] rounded-3xl p-8 text-white shadow-xl shadow-blue-900/10">
            <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-6">Agent Information</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-blue-400">
                  {lead.client?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-xs font-black uppercase">{lead.client?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{lead.client?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const InfoBox = ({ label, value, icon, color = "text-slate-800" }) => (
  <div>
    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-center gap-2">
      {icon && <span className="text-blue-500/50">{icon}</span>}
      <p className={`text-sm font-black uppercase truncate ${color}`}>{value || '—'}</p>
    </div>
  </div>
);

const DocLink = ({ name, url }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noreferrer" 
    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl group hover:bg-slate-900 hover:border-slate-900 transition-all shadow-sm"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
        <FileText size={20} className="text-blue-600 group-hover:text-blue-400" />
      </div>
      <div>
        <span className="block text-[10px] font-black text-slate-900 group-hover:text-white uppercase truncate max-w-[150px]">
          {name}
        </span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">View Resource</span>
      </div>
    </div>
    <ExternalLink size={16} className="text-gray-300 group-hover:text-white" />
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
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

export default LeadDetailsView;