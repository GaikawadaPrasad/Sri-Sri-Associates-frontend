import React from 'react';
import { User, ArrowUpRight, Mail, ShieldCheck } from 'lucide-react';

const ClientCard = ({ client, onView }) => {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
      <div className="flex justify-between items-start mb-4">
        {/* Avatar Circle */}
        <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center text-xl font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {client.name.charAt(0)}
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full">
          <ShieldCheck size={12} />
          <span className="text-[9px] font-black uppercase">Active Agent</span>
        </div>
      </div>

      {/* Identity */}
      <div className="mb-6">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">
          {client.name}
        </h3>
        <div className="flex items-center gap-2 text-gray-400 mt-1">
          <Mail size={12} />
          <p className="text-[10px] font-bold truncate">{client.email}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onView}
        className="w-full py-4 bg-gray-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-[#050C25] group-hover:text-white transition-all active:scale-95"
      >
        View Full Profile
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
};

export default ClientCard;