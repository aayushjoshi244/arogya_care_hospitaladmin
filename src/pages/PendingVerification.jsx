import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw, 
  LogOut, 
  FileText,
  Building2,
  AlertOctagon
} from 'lucide-react';
import logo from '../assets/arogya_logo.jpg';

const PendingVerification = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkStatus();
    
    // Poll status every 15 seconds
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    setError('');
    try {
      const res = await api.get('/profile');
      if (res.success) {
        if (res.registered) {
          setProfile(res.data);
          if (res.status === 'APPROVED') {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // Redirect to register if somehow lost
          navigate('/register-hospital', { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection to security gateway failed.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStepClass = (stepActive) => {
    return stepActive 
      ? 'border-primary text-primary font-bold' 
      : 'border-slate-200 text-slate-400 font-semibold';
  };

  const getStepIcon = (stepActive, isDone) => {
    if (isDone) return <CheckCircle2 size={18} className="text-primary shrink-0" />;
    return (
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 ${
        stepActive ? 'border-primary text-primary bg-primary-bg' : 'border-slate-200 text-slate-400'
      }`}>
        {stepActive ? '✓' : ''}
      </div>
    );
  };

  const isRejected = profile?.verification_status === 'REJECTED';
  const isBlocked = profile?.verification_status === 'SUSPENDED';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, rgba(10, 110, 110, 0.04) 0%, rgba(248, 250, 252, 1) 100%)' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center overflow-hidden rounded-3xl w-24 h-24 border border-slate-100 shadow-xl bg-white">
            <img src={logo} alt="Arogya Care Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="mt-6 text-xl font-extrabold text-slate-800 tracking-tight">
            Compliance Verification Audit
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-semibold">
            Registered: {profile?.name || 'Arogya Network Center'}
          </p>
        </div>

        {/* Verification Status card */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-3xl border border-slate-100 space-y-6 text-xs">
          
          {error && (
            <div className="bg-error-bg border border-error/20 p-3 rounded-xl text-error-text font-semibold flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Core Status Message */}
          {isRejected ? (
            <div className="bg-error-bg border border-error/20 p-4 rounded-2xl text-error-text space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertOctagon size={18} className="shrink-0" />
                <span>Application Rejected</span>
              </div>
              <p className="opacity-95 leading-relaxed font-semibold">
                Your hospital enrollment application was rejected by the compliance auditing team.
              </p>
              {profile?.rejection_reason && (
                <div className="bg-white/60 p-3 rounded-xl border border-error/10 font-bold mt-1 text-[10px]">
                  Audit Feedback: "{profile.rejection_reason}"
                </div>
              )}
            </div>
          ) : isBlocked ? (
            <div className="bg-error-bg border border-error/20 p-4 rounded-2xl text-error-text space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertOctagon size={18} className="shrink-0" />
                <span>Account Blocked / Suspended</span>
              </div>
              <p className="opacity-95 leading-relaxed font-semibold">
                Your hospital administrative tenant account has been blocked or suspended by the platform admins.
              </p>
              {profile?.rejection_reason && (
                <div className="bg-white/60 p-3 rounded-xl border border-error/10 font-bold mt-1 text-[10px]">
                  Reason: "{profile.rejection_reason}"
                </div>
              )}
            </div>
          ) : (
            <div className="bg-warning-bg border border-warning/20 p-4 rounded-2xl text-warning-text space-y-2">
              <div className="flex items-center gap-2 font-bold animate-pulse">
                <Clock size={18} className="shrink-0" />
                <span>Application Under Audit Review</span>
              </div>
              <p className="opacity-95 leading-relaxed font-semibold">
                Our verification team is currently auditing your state medical certificates and pan/gst registration filings.
              </p>
            </div>
          )}

          {/* Timeline Roster */}
          <div className="border-t border-slate-50 pt-5 space-y-4 font-semibold text-slate-700">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registration Timeline</h4>
            
            <div className="space-y-4">
              {/* Step 1: Registered */}
              <div className="flex items-start gap-3">
                {getStepIcon(true, true)}
                <div>
                  <p className="text-slate-800">Hospital Application Submitted</p>
                  <p className="text-[10px] text-slate-400 font-medium">Record generated under ID: {profile?.hospital_id}</p>
                </div>
              </div>

              {/* Step 2: Verification Audit */}
              <div className="flex items-start gap-3">
                {getStepIcon(!isRejected && !isBlocked, false)}
                <div>
                  <p className={isRejected || isBlocked ? 'text-slate-400 font-semibold' : 'text-slate-800 font-bold'}>
                    Compliance Document Audit
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Verifying license certificates and PAN records</p>
                </div>
              </div>

              {/* Step 3: Verified Active */}
              <div className="flex items-start gap-3">
                {getStepIcon(profile?.verification_status === 'APPROVED', false)}
                <div>
                  <p className="text-slate-400 font-semibold">Operational Dashboard Active</p>
                  <p className="text-[10px] text-slate-400 font-medium">Platform credentials verified; doctors booking slots unlocked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-50 pt-5 flex items-center justify-between gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-xl hover-scale transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>

            <button
              onClick={checkStatus}
              disabled={checking}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white font-bold rounded-xl hover-scale transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              Check Status
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PendingVerification;
