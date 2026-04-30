

import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calculator,
  LogOut, 
  Briefcase,
  PlusSquare
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'EMI Calculator', path: '/admin/emi-calculator', icon: <Calculator size={20} /> },
    { name: 'Agents', path: '/admin/agents', icon: <Users size={20} /> },
  ];

  const clientLinks = [
    { name: 'Dashboard', path: '/client/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My History', path: '/client/leads', icon: <FileText size={20} /> },
    { name: 'EMI Calculator', path: '/client/emi-calculator', icon: <Calculator size={20} /> },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : clientLinks;

  return (
    <div className="hidden lg:flex w-64 bg-[#0A1D37] min-h-screen text-white flex-col p-6 fixed left-0 top-0 z-50">
      <div className="mb-10 px-2 flex items-center gap-2">
        <Briefcase className="text-blue-500" size={24} />
        <h1 className="text-xl font-black tracking-tighter">
          SRI SRI <span className="text-blue-500 font-light">ASSOC.</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4 mb-4">Main Menu</p>
        {links.map((link) => (

            
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {link.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout Section */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-xs font-bold truncate uppercase">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role}</p>
            </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;