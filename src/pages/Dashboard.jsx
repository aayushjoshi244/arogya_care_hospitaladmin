import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Stethoscope, 
  Clock, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  Activity,
  FlaskConical,
  Pill,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hospitalStatus, hospitalData } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isApproved = hospitalStatus === 'APPROVED';

  useEffect(() => {
    if (isApproved) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isApproved]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch overview statistics
      const statsRes = await api.get('/analytics/overview');
      if (statsRes.success) setStats(statsRes.data);

      // 2. Fetch revenue timeline data
      const chartRes = await api.get('/analytics/revenue-chart');
      if (chartRes.success) setRevenueData(chartRes.data || []);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch dashboard metrics. Verify backend integration.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-slate-500 font-medium mt-3">Loading operational dashboard...</p>
      </div>
    );
  }

  // Parse suspension metadata if suspended
  let suspensionMeta = null;
  if (hospitalStatus === 'SUSPENDED' && hospitalData?.rejection_reason) {
    try {
      suspensionMeta = JSON.parse(hospitalData.rejection_reason);
    } catch (e) {
      // Ignore
    }
  }

  // Onboarding setup view for unapproved hospitals
  if (!isApproved) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Verification Status Alert */}
        {hospitalStatus === 'SUSPENDED' ? (
          <div className="bg-red-50 border border-red-200/50 p-6 rounded-3xl text-red-800 flex items-start gap-4 shadow-sm shadow-red-100/30">
            <div className="p-3 bg-red-105 text-red-700 rounded-2xl shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm tracking-tight text-slate-800">Hospital Operations Suspended</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                This facility has been suspended by Arogya Care Super Admins. 
                {suspensionMeta && (
                  <span className="block mt-1 font-bold text-red-650">
                    Suspension Period: from {suspensionMeta.suspended_at ? new Date(suspensionMeta.suspended_at).toLocaleDateString() : 'N/A'} to {suspensionMeta.expires_at ? new Date(suspensionMeta.expires_at).toLocaleDateString() : 'N/A'} ({suspensionMeta.duration_days} days).
                  </span>
                )}
                Patient check-ins, online appointment scheduling, and doctor roster operations are temporarily disabled until the suspension period completes or is lifted by the administration.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200/50 p-6 rounded-3xl text-amber-800 flex items-start gap-4 shadow-sm shadow-amber-100/30">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0 mt-0.5">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm tracking-tight text-slate-800">Hospital Verification Awaiting Superadmin Review</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Your hospital registration is currently undergoing verification by Arogya Care Super Admins. During this phase, you can start onboarding your staff, pharmacy inventory, and lab testing directory.
              </p>
            </div>
          </div>
        )}

        {/* Setup Cards Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Onboarding Setup Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Step 1: Onboard Doctors */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 flex flex-col justify-between h-48 hover-scale">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Stethoscope size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">1. Onboard Doctors</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Add clinical profiles, specialized departments, and experience parameters.</p>
              </div>
              <button 
                onClick={() => navigate('/doctors')} 
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-primary-bg hover:text-primary rounded-xl text-xs font-bold text-slate-600 transition-all border border-slate-100 hover:border-primary/20"
              >
                <span>Onboard Staff</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Step 2: Configure Lab Tests */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 flex flex-col justify-between h-48 hover-scale">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <FlaskConical size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">2. Configure Lab Tests</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Set up diagnostic tests, pathological panels, radiology services, and billing prices.</p>
              </div>
              <button 
                onClick={() => navigate('/lab-tests')} 
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-purple-50/50 hover:text-purple-600 rounded-xl text-xs font-bold text-slate-600 transition-all border border-slate-100 hover:border-purple-200/30"
              >
                <span>Manage Labs</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Step 3: Add Medicines Stock */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 flex flex-col justify-between h-48 hover-scale">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Pill size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">3. Stock Medicines</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Add medicine names, dosage configurations, pricing, and available pharmacy stock quantities.</p>
              </div>
              <button 
                onClick={() => navigate('/medicines')} 
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-emerald-50/50 hover:text-emerald-600 rounded-xl text-xs font-bold text-slate-600 transition-all border border-slate-100 hover:border-emerald-200/30"
              >
                <span>Manage Pharmacy</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>

        {/* Feature Lock Summary */}
        <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Locked Features (Awaiting Approval)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100">
              <Lock size={14} className="text-slate-300" />
              <span>Shift Scheduling</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100">
              <Lock size={14} className="text-slate-300" />
              <span>Live Queue Board</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100">
              <Lock size={14} className="text-slate-300" />
              <span>Analytics & Earnings</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100">
              <Lock size={14} className="text-slate-300" />
              <span>Hospital Settings</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error alert banner */}
      {error && (
        <div className="bg-error-bg border border-error/20 p-4 rounded-xl text-error-text text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="ml-auto underline font-bold">Retry</button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Patients */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex items-center justify-between hover-scale">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospital Patients</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{stats?.totalPatients || 0}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Users size={22} />
          </div>
        </div>

        {/* Active Doctors */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex items-center justify-between hover-scale">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Doctors</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{stats?.activeDoctors || 0}</h3>
          </div>
          <div className="p-3 bg-success-bg text-success-text rounded-2xl">
            <Stethoscope size={22} />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex items-center justify-between hover-scale">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Doctors</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{stats?.pendingDoctors || 0}</h3>
          </div>
          <div className="p-3 bg-warning-bg text-warning-text rounded-2xl">
            <Clock size={22} />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex items-center justify-between hover-scale">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Gross Billing</p>
            <h3 className="text-2xl font-extrabold text-slate-800 font-numeric">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</h3>
          </div>
          <div className="p-3 bg-success-bg text-success-text rounded-2xl">
            <DollarSign size={22} />
          </div>
        </div>

      </div>

      {/* Main Grid: Chart & Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 30 Days Billing Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Billing Trends</h3>
              <p className="text-xs text-slate-400 font-medium">Monthly timeline of captured consultations payment fees</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-success-text font-bold bg-success-bg px-2.5 py-1 rounded-full">
              <TrendingUp size={14} />
              <span>Gross Income</span>
            </div>
          </div>

          <div className="flex-1 min-h-[280px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A6E6E" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0A6E6E" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                    labelStyle={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}
                    itemStyle={{ fontSize: 11, fontWeight: 600, color: '#0A6E6E' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0A6E6E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No billing transaction records logged in the last 30 days.
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="space-y-6">
          
          {/* Operations Actions Card */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quick Actions</h3>
            
            <div className="space-y-3.5">
              <button
                onClick={() => navigate('/live-board')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-primary-bg hover:border-primary/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Activity size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">Live Operations Board</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Check-in patients and view token lines</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/doctors')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-primary-bg hover:border-primary/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Stethoscope size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">Onboard Medical Staff</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Add clinical licenses and set schedules</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/scheduling')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-primary-bg hover:border-primary/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Calendar size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">Configure Doctor Shifts</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Roster shift hours and available slots</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Pending Alerts widget */}
          {stats?.pendingDoctors > 0 && (
            <div className="bg-warning-bg border border-warning/20 p-5 rounded-3xl flex items-start gap-3.5 text-warning-text">
              <Clock size={22} className="shrink-0 animate-pulse mt-0.5" />
              <div>
                <p className="font-bold text-sm">Staff Awaiting Verification</p>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  You have <strong>{stats.pendingDoctors}</strong> onboarded doctors awaiting credentials verification from the Arogya Care Super Admins.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
