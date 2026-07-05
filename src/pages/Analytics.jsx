import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Stethoscope, 
  Calendar, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Analytics = () => {
  const [doctorsPerformance, setDoctorsPerformance] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch doctor performance splits
      const perfRes = await api.get('/analytics/doctor-performance');
      if (perfRes.success) {
        setDoctorsPerformance(perfRes.data || []);
      }

      // 2. Fetch revenue timeline data
      const chartRes = await api.get('/analytics/revenue-chart');
      if (chartRes.success) {
        setRevenueData(chartRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch hospital performance reports');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = doctorsPerformance.reduce((acc, curr) => acc + curr.total_revenue, 0);
  const totalAppointments = doctorsPerformance.reduce((acc, curr) => acc + curr.total_appointments, 0);
  const topDoctor = doctorsPerformance.length > 0 ? doctorsPerformance[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Income & Performance Reports</h2>
        <p className="text-slate-400 text-sm font-medium mt-0.5">Audit monthly gross earnings, monitor individual clinician consultation volumes, and review revenue timelines</p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-error-bg border border-error/20 p-4 rounded-xl text-error-text text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Gross Revenue */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex items-center gap-4 hover-scale">
          <div className="p-3.5 bg-success-bg text-success-text rounded-2xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Gross Billings (Paid)</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex items-center gap-4 hover-scale">
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Total Consultations</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">
              {totalAppointments} Sessions
            </h3>
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex items-center gap-4 hover-scale">
          <div className="p-3.5 bg-amber-50 text-amber-500 rounded-2xl">
            <Award size={24} />
          </div>
          <div className="truncate">
            <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Top Performing Clinician</p>
            <h3 className="text-sm font-extrabold text-slate-800 mt-1 truncate">
              {topDoctor ? topDoctor.name : 'N/A'}
            </h3>
            {topDoctor && (
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5 truncate">
                {topDoctor.specialty}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Chart & Doctor Performance List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Captured Revenue Timeline</h3>
              <p className="text-xs text-slate-400 font-medium">Daily income aggregation for the last 30 days</p>
            </div>
          </div>

          <div className="flex-1 min-h-[250px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="revenue" stroke="#0A6E6E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No billing timeline data logged.
              </div>
            )}
          </div>
        </div>

        {/* Right: Clinician breakdown */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Clinician Breakdown</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total sessions and captured bills per doctor</p>
          </div>

          {loading ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : doctorsPerformance.length > 0 ? (
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {doctorsPerformance.map(doc => (
                <div key={doc.doctor_id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover-scale">
                  <div className="truncate pr-4">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5 truncate">{doc.specialty}</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">{doc.total_appointments} consultations</p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 shrink-0">
                    ₹{doc.total_revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No staff performance logs recorded.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Analytics;
