import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  Activity, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Pill,
  Lock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/arogya_logo.jpg';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiredApproval: false },
  { path: '/doctors', icon: Stethoscope, label: 'Doctors', requiredApproval: false },
  { path: '/lab-tests', icon: FlaskConical, label: 'Lab Tests', requiredApproval: false },
  { path: '/medicines', icon: Pill, label: 'Medicines', requiredApproval: false },
  { path: '/scheduling', icon: Calendar, label: 'Scheduling', requiredApproval: true },
  { path: '/live-board', icon: Activity, label: 'Live Board', requiredApproval: true },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', requiredApproval: true },
  { path: '/settings', icon: Settings, label: 'Settings', requiredApproval: true },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, hospitalStatus } = useAuth();
  const navigate = useNavigate();
  
  const isApproved = hospitalStatus === 'APPROVED';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className={`
      h-screen bg-white border-r border-slate-200 
      transition-all duration-300 flex flex-col z-20 shrink-0
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="shrink-0 overflow-hidden rounded-lg border border-slate-100">
            <img src={logo} alt="Arogya Care Logo" className="w-9 h-9 object-cover" />
          </div>
          {!collapsed && (
            <div className="flex flex-col select-none">
              <span className="font-bold text-slate-800 leading-none text-sm">Arogya Care</span>
              <span className="text-[9px] text-primary font-bold tracking-wider uppercase mt-1">Hospital Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isLocked = item.requiredApproval && !isApproved;

          if (isLocked) {
            return (
              <div
                key={item.path}
                title="Superadmin approval required to unlock this feature"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-tight text-slate-350 cursor-not-allowed hover:bg-slate-50/50 transition-all duration-200 select-none"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="shrink-0 text-slate-300" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && <Lock size={12} className="text-slate-350 shrink-0" />}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-tight transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-850'
                }
              `}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Toggle & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all duration-200 text-xs font-semibold"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-error hover:bg-error-bg rounded-xl transition-all duration-200 text-xs font-bold"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout Account</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
