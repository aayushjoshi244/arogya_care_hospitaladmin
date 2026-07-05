import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-5">
      <div className="p-4 bg-error-bg text-error rounded-3xl animate-bounce">
        <ShieldAlert size={48} />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">404 - Section Not Found</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">The operations page you requested is not mapped or verified</p>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl hover-scale transition-all"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
