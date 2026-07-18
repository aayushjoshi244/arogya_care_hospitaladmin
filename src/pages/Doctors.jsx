import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabase';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Ban, 
  XCircle, 
  AlertCircle,
  FileCheck2,
  Phone,
  Mail,
  UserCheck2,
  DollarSign,
  GraduationCap,
  Calendar,
  X,
  Edit2,
  Trash2
} from 'lucide-react';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${name}? This will permanently delete their profile and log them out of all active clinical sessions.`)) {
      return;
    }
    setError('');
    setMessage('');
    try {
      const res = await api.delete(`/doctors/${id}`);
      if (res.success) {
        setMessage(`Dr. ${name} was successfully removed.`);
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete doctor profile');
    }
  };

  // Onboard Modal Form
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState(() => {
    const saved = localStorage.getItem('arogya_onboard_doctor_form');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      password: '',
      gender: 'Male',
      date_of_birth: '',
      specialization_id: '',
      medical_registration_number: '',
      qualification: '',
      experience_years: '',
      consultation_fee: 500,
      slot_duration_minutes: 15,
      max_patients_per_day: 20,
      bio: '',
      profile_image_url: ''
    };
  });

  // Edit Modal Form
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    specialization_id: '',
    qualification: '',
    experience_years: '',
    consultation_fee: 500,
    slot_duration_minutes: 15,
    max_patients_per_day: 20,
    bio: '',
    profile_image_url: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    localStorage.setItem('arogya_onboard_doctor_form', JSON.stringify(onboardForm));
  }, [onboardForm]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors');
      if (res.success) setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      // Fetch directly from public database
      const { data, error } = await supabase
        .from('master_specializations')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setSpecializations(data || []);
    } catch (err) {
      console.error('Failed to load specializations:', err);
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/doctors', onboardForm);
      if (res.success) {
        setMessage('Doctor successfully onboarded! Application pending validation.');
        setOnboardModalOpen(false);
        resetOnboardForm();
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to onboard doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await api.put(`/doctors/${editingDoc.id}`, editForm);
      if (res.success) {
        setMessage('Doctor configurations updated successfully.');
        setEditModalOpen(false);
        setEditingDoc(null);
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setEditForm({
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      gender: doc.gender || 'Male',
      date_of_birth: doc.date_of_birth || '',
      specialization_id: doc.specialization_id || '',
      qualification: doc.qualification || '',
      experience_years: doc.experience_years || '',
      consultation_fee: doc.consultation_fee || 500,
      slot_duration_minutes: doc.slot_duration_minutes || 15,
      max_patients_per_day: doc.max_patients_per_day || 20,
      bio: doc.bio || '',
      profile_image_url: doc.profile_image_url || ''
    });
    setEditModalOpen(true);
  };

  const resetOnboardForm = () => {
    setOnboardForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      gender: 'Male',
      date_of_birth: '',
      specialization_id: '',
      medical_registration_number: '',
      qualification: '',
      experience_years: '',
      consultation_fee: 500,
      slot_duration_minutes: 15,
      max_patients_per_day: 20,
      bio: '',
      profile_image_url: ''
    });
    localStorage.removeItem('arogya_onboard_doctor_form');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 bg-success-bg text-success-text px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 size={12} /> Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 bg-warning-bg text-warning-text px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
            <Clock size={12} /> Pending Audit
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 bg-error-bg text-error-text px-2.5 py-1 rounded-full text-xs font-bold">
            <Ban size={12} /> Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 bg-error-bg text-error-text px-2.5 py-1 rounded-full text-xs font-bold">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                        (doc.master_specializations?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || doc.verification_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Medical Directory</h2>
          <p className="text-slate-400 text-sm font-medium mt-0.5">Manage onboarded clinical staff, update shift duration settings, and audit certification profiles</p>
        </div>
        
        <button
          onClick={() => {
            resetOnboardForm();
            setOnboardModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary-hover hover-scale transition-all text-sm"
        >
          <Plus size={18} />
          Onboard Clinician
        </button>
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

      {/* Filters & Search Row */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm shadow-slate-100/50">
        
        {/* Search */}
        <div className="relative flex-1 rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by Doctor Name or Specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter size={18} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
          >
            <option value="">All Verification States</option>
            <option value="VERIFIED">Verified / Active</option>
            <option value="PENDING">Pending Audit</option>
            <option value="BLOCKED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-slate-400 text-xs font-semibold mt-3">Fetching medical directory...</p>
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/50 flex flex-col justify-between hover-scale relative overflow-hidden">
              {/* Badge */}
              <div className="absolute top-4 right-4">
                {getStatusBadge(doc.verification_status)}
              </div>

              {/* Main details */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {/* Photo frame */}
                  <div className="w-14 h-16 bg-slate-100 text-primary border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {doc.profile_image_url ? (
                      <img src={doc.profile_image_url} alt={doc.name} className="w-full h-full object-cover" />
                    ) : (
                      <Stethoscope size={24} />
                    )}
                  </div>
                  
                  {/* Name & Specialization */}
                  <div className="pr-16 truncate">
                    <h3 className="font-extrabold text-slate-800 leading-tight truncate">{doc.name}</h3>
                    <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">
                      {doc.master_specializations?.name || 'General Practitioner'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{doc.qualification}</p>
                  </div>
                </div>

                {/* Experience & Fees info */}
                <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-3 text-xs font-medium">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Experience</p>
                    <p className="font-bold text-slate-700 mt-0.5">{doc.experience_years} Years Active</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Consultation Fee</p>
                    <p className="font-bold text-primary mt-0.5">₹{doc.consultation_fee}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Slot Duration</p>
                    <p className="font-semibold text-slate-650 mt-0.5">{doc.slot_duration_minutes} Mins</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Registration No.</p>
                    <p className="font-semibold text-slate-650 mt-0.5 truncate">{doc.medical_registration_number}</p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-750">{doc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-750 truncate">{doc.email}</span>
                  </div>
                </div>
              </div>

              {/* Modify actions */}
              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-error/15 text-error hover:bg-error-bg hover:text-error-text rounded-xl text-xs font-bold transition-all"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
                <button
                  onClick={() => openEditModal(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:border-primary/20 hover:bg-primary-bg hover:text-primary rounded-xl text-xs font-bold transition-all"
                >
                  <Edit2 size={12} />
                  Edit Profile & Slots
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center shadow-sm">
          <p className="text-slate-400 text-sm font-medium">No doctors onboarded under this hospital directory matching search filters.</p>
        </div>
      )}

      {/* Onboard Clinician Modal */}
      {onboardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Onboard Clinical Practitioner</h3>
              <button onClick={() => setOnboardModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Full Name</label>
                  <input
                    type="text" required
                    placeholder="e.g. Dr. Priya Mehta"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({...onboardForm, name: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Medical Specialization</label>
                  <select
                    required
                    value={onboardForm.specialization_id}
                    onChange={(e) => setOnboardForm({...onboardForm, specialization_id: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="">Select Specialty...</option>
                    {specializations.map(spec => (
                      <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Email Address</label>
                  <input
                    type="email" required
                    placeholder="e.g. priya.mehta@arogyacare.com"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({...onboardForm, email: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Contact Phone</label>
                  <input
                    type="text" required
                    placeholder="e.g. +91 9876543210"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({...onboardForm, phone: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Temporary Password</label>
                  <input
                    type="password" required
                    placeholder="Set temporary login password..."
                    value={onboardForm.password}
                    onChange={(e) => setOnboardForm({...onboardForm, password: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid 2: Qualification & Medical Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Qualification Degrees</label>
                  <input
                    type="text" required
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    value={onboardForm.qualification}
                    onChange={(e) => setOnboardForm({...onboardForm, qualification: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">MCI Medical Registration Number</label>
                  <input
                    type="text" required
                    placeholder="e.g. MCI-12345-2015"
                    value={onboardForm.medical_registration_number}
                    onChange={(e) => setOnboardForm({...onboardForm, medical_registration_number: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Years of Experience</label>
                  <input
                    type="number" min="0" required
                    placeholder="e.g. 8"
                    value={onboardForm.experience_years}
                    onChange={(e) => setOnboardForm({...onboardForm, experience_years: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Gender Scope</label>
                  <select
                    value={onboardForm.gender}
                    onChange={(e) => setOnboardForm({...onboardForm, gender: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Grid 3: Roster Limits & Consultation Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number" min="0" required
                    value={onboardForm.consultation_fee}
                    onChange={(e) => setOnboardForm({...onboardForm, consultation_fee: parseInt(e.target.value)})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Slot Duration (Mins)</label>
                  <input
                    type="number" min="5" required
                    value={onboardForm.slot_duration_minutes}
                    onChange={(e) => setOnboardForm({...onboardForm, slot_duration_minutes: parseInt(e.target.value)})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Max Patients / Day</label>
                  <input
                    type="number" min="1" required
                    value={onboardForm.max_patients_per_day}
                    onChange={(e) => setOnboardForm({...onboardForm, max_patients_per_day: parseInt(e.target.value)})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Profile Image URL */}
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setOnboardForm({...onboardForm, profile_image_url: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none bg-slate-50 text-xs"
                  />
                  {onboardForm.profile_image_url && (
                    <img 
                      src={onboardForm.profile_image_url} 
                      alt="Preview" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Clinician Bio / Professional Profile</label>
                <textarea
                  rows={3}
                  placeholder="Professional experience bio details..."
                  value={onboardForm.bio}
                  onChange={(e) => setOnboardForm({...onboardForm, bio: e.target.value})}
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              {/* Save actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setOnboardModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold hover-scale transition-all"
                >
                  Onboard Practitioner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Clinician Configuration Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Edit Doctor Profile & Slots</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{editingDoc?.email}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Full Name</label>
                <input
                  type="text" required
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Contact Phone</label>
                <input
                  type="text" required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Consultation Fee (₹)</label>
                <input
                  type="number" min="0" required
                  value={editForm.consultation_fee}
                  onChange={(e) => setEditForm({...editForm, consultation_fee: parseInt(e.target.value)})}
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Slot Duration (Mins)</label>
                <input
                  type="number" min="5" required
                  value={editForm.slot_duration_minutes}
                  onChange={(e) => setEditForm({...editForm, slot_duration_minutes: parseInt(e.target.value)})}
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Max Patients / Day</label>
                <input
                  type="number" min="1" required
                  value={editForm.max_patients_per_day}
                  onChange={(e) => setEditForm({...editForm, max_patients_per_day: parseInt(e.target.value)})}
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditForm({...editForm, profile_image_url: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none bg-slate-50 text-xs"
                  />
                  {editForm.profile_image_url && (
                    <img 
                      src={editForm.profile_image_url} 
                      alt="Preview" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Bio / Profile Summary</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                />
              </div>

              {/* Submit actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold hover-scale transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Doctors;
