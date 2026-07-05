import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Bell, User } from 'lucide-react';

const TopNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Hospital Operations';
    if (path.startsWith('/doctors')) return 'Medical Directory';
    if (path.startsWith('/scheduling')) return 'Shift Scheduling';
    if (path.startsWith('/live-board')) return 'Live Queue Monitor';
    if (path.startsWith('/analytics')) return 'Income & Queue Report';
    if (path.startsWith('/settings')) return 'Hospital Coordinates';
    return 'Authorized Console';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-2 border-l border-slate-100 pl-4 select-none">
          <div className="w-9 h-9 bg-primary/10 text-primary font-bold text-xs rounded-xl flex items-center justify-center border border-primary/20 uppercase">
            H
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-bold text-slate-800 text-xs tracking-tight">Hospital Admin</span>
            <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5 truncate max-w-[120px]">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
