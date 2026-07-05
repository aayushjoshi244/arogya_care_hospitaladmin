import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Calendar, 
  Clock, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck2,
  Lock,
  Loader2
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' }
];

const Scheduling = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [schedules, setSchedules] = useState([]);
  
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingSched, setLoadingSched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorSchedules(selectedDoctorId);
    } else {
      setSchedules([]);
    }
  }, [selectedDoctorId]);

  const fetchDoctors = async () => {
    setLoadingDocs(true);
    try {
      const res = await api.get('/doctors');
      if (res.success) {
        const list = res.data || [];
        setDoctors(list.filter(d => d.verification_status === 'VERIFIED'));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch verified staff list');
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchDoctorSchedules = async (doctorId) => {
    setLoadingSched(true);
    setError('');
    setMessage('');
    try {
      const res = await api.get(`/scheduling/${doctorId}`);
      if (res.success) {
        // Initialize days
        const rawList = res.data || [];
        const mapped = DAYS_OF_WEEK.map(day => {
          const match = rawList.find(r => r.day_of_week === day.id);
          return {
            day_of_week: day.id,
            label: day.label,
            start_time: match ? match.start_time.slice(0, 5) : '09:00',
            end_time: match ? match.end_time.slice(0, 5) : '17:00',
            is_available: match ? match.is_available : false
          };
        });
        setSchedules(mapped);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load roster schedules');
    } finally {
      setLoadingSched(false);
    }
  };

  const handleToggleAvailable = (dayId) => {
    setSchedules(schedules.map(sched => {
      if (sched.day_of_week === dayId) {
        return { ...sched, is_available: !sched.is_available };
      }
      return sched;
    }));
  };

  const handleTimeChange = (dayId, field, value) => {
    setSchedules(schedules.map(sched => {
      if (sched.day_of_week === dayId) {
        return { ...sched, [field]: value };
      }
      return sched;
    }));
  };

  const handleSaveRoster = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post(`/scheduling/${selectedDoctorId}`, {
        schedules
      });
      if (res.success) {
        setMessage(' Roster schedule saved successfully!');
        fetchDoctorSchedules(selectedDoctorId);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save weekly schedule configuration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Shift Scheduling</h2>
        <p className="text-slate-400 text-sm font-medium mt-0.5">Define weekly rosters, set active shifts, and configure clinician booking availabilities</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-error-bg border border-error/20 p-4 rounded-xl text-error-text text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-success-bg border border-success/20 p-4 rounded-xl text-success-text text-sm flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Select Doctor Card */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm shadow-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Clinician</h3>
          <p className="text-xs text-slate-400 font-medium">Only verified medical staff can have shift schedules configured</p>
        </div>

        <div className="w-full sm:w-72">
          {loadingDocs ? (
            <p className="text-slate-400 text-xs font-semibold">Loading verified staff...</p>
          ) : (
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 bg-white font-bold text-sm focus:outline-none"
            >
              <option value="">Choose a doctor...</option>
              {doctors.map(doc => (
                <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Roster Calendar List */}
      {selectedDoctorId && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/50 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Weekly Shift Calendar</h3>
              <p className="text-xs text-slate-400 font-medium">Enable working days and set start/end shift hours</p>
            </div>
            
            <button
              onClick={handleSaveRoster}
              disabled={submitting || loadingSched}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover-scale transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Roster
                </>
              )}
            </button>
          </div>

          {loadingSched ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-slate-400 text-xs font-semibold mt-3">Fetching roster configurations...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveRoster} className="space-y-4">
              <div className="divide-y divide-slate-50">
                {schedules.map((sched) => (
                  <div key={sched.day_of_week} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm font-semibold">
                    {/* Day name & Availability Switch */}
                    <div className="flex items-center gap-4 min-w-[150px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sched.is_available}
                          onChange={() => handleToggleAvailable(sched.day_of_week)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                      <span className={`text-sm ${sched.is_available ? 'text-slate-800 font-extrabold' : 'text-slate-400'}`}>
                        {sched.label}
                      </span>
                    </div>

                    {/* Shift timings inputs */}
                    {sched.is_available ? (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Start</span>
                          <input
                            type="time"
                            value={sched.start_time}
                            onChange={(e) => handleTimeChange(sched.day_of_week, 'start_time', e.target.value)}
                            className="bg-transparent text-slate-700 font-bold focus:outline-none"
                          />
                        </div>
                        
                        <span className="text-slate-400 font-medium">to</span>

                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-400 uppercase font-bold">End</span>
                          <input
                            type="time"
                            value={sched.end_time}
                            onChange={(e) => handleTimeChange(sched.day_of_week, 'end_time', e.target.value)}
                            className="bg-transparent text-slate-700 font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic font-medium flex items-center gap-1.5 py-2">
                        <Lock size={14} />
                        Practitioner Roster Suspended / Closed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Scheduling;
