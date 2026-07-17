import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Ban, 
  AlertCircle,
  Phone,
  Mail,
  Lock,
  X,
  Trash2
} from 'lucide-react';

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');

  // Onboard Modal Form
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    profile_image_url: '',
    tests: []
  });

  const [newTestName, setNewTestName] = useState('');
  const [newTestPrice, setNewTestPrice] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('Pathology');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleDeleteTechnician = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? This will permanently delete their profile and revoke their credentials access.`)) {
      return;
    }
    setError('');
    setMessage('');
    try {
      const res = await api.delete(`/technicians/${id}`);
      if (res.success) {
        setMessage(`${name} was successfully removed.`);
        fetchTechnicians();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to remove technician profile');
    }
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const res = await api.get('/technicians');
      if (res.success) setTechnicians(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load technicians directory');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestToOnboard = () => {
    if (!newTestName || !newTestPrice) return;
    setOnboardForm(prev => ({
      ...prev,
      tests: [...(prev.tests || []), { test_name: newTestName, price: parseFloat(newTestPrice) || 0, category: newTestCategory }]
    }));
    setNewTestName('');
    setNewTestPrice('');
    setNewTestCategory('Pathology');
  };

  const handleRemoveTestFromOnboard = (indexToRemove) => {
    setOnboardForm(prev => ({
      ...prev,
      tests: (prev.tests || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/technicians', onboardForm);
      if (res.success) {
        setMessage('Lab technician onboarded successfully!');
        setOnboardModalOpen(false);
        resetOnboardForm();
        fetchTechnicians();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to onboard technician');
    } finally {
      setSubmitting(false);
    }
  };

  const resetOnboardForm = () => {
    setOnboardForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      tests: []
    });
    setNewTestName('');
    setNewTestPrice('');
    setNewTestCategory('Pathology');
  };

  const filteredTechs = technicians.filter(tech => 
    tech.name.toLowerCase().includes(search.toLowerCase()) || 
    tech.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lab Technicians Directory</h2>
          <p className="text-slate-400 text-sm font-medium mt-0.5">Manage onboarded lab specialists, monitor accounts status, and register credential scopes</p>
        </div>
        
        <button
          onClick={() => {
            resetOnboardForm();
            setOnboardModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary-hover hover-scale transition-all text-sm"
        >
          <Plus size={18} />
          Onboard Technician
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

      {/* Search Row */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex gap-4 shadow-sm shadow-slate-100/50">
        <div className="relative flex-1 rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search technicians by Name or Email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-slate-400 text-xs font-semibold mt-3">Fetching technicians data...</p>
        </div>
      ) : filteredTechs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTechs.map((tech) => (
            <div key={tech.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/50 flex flex-col justify-between hover-scale relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  tech.is_active ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'
                }`}>
                  {tech.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-bg text-primary border border-primary/10 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                    {tech.profile_image_url ? (
                      <img src={tech.profile_image_url} alt={tech.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={20} />
                    )}
                  </div>
                  <div className="pr-12 truncate">
                    <h3 className="font-extrabold text-slate-800 text-xs truncate">{tech.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {tech.technician_id}</p>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 space-y-2 text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{tech.email}</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-55 bg-slate-50/50 p-2.5 rounded-xl flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>First Login Reset:</span>
                  <span className={tech.password_changed ? 'text-success-text' : 'text-warning-text'}>
                    {tech.password_changed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                {/* Handled Lab Tests */}
                {tech.hospital_lab_tests && tech.hospital_lab_tests.length > 0 ? (
                  <div className="mt-3 border-t border-slate-100 pt-2.5 space-y-1">
                    <p className="text-slate-450 font-bold uppercase text-[9px] tracking-wide mb-1">Managed Lab Tests</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {tech.hospital_lab_tests.map((t, idx) => (
                        <span key={idx} className="bg-primary-bg text-primary-dark font-extrabold px-2 py-0.5 rounded-lg text-[9px] border border-primary/10">
                          {t.test_name} [{t.category || 'Pathology'}] (₹{t.price})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                    <p className="text-slate-400 italic text-[10px]">No assigned tests registered.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteTechnician(tech.id, tech.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-error/15 text-error hover:bg-error-bg hover:text-error-text rounded-xl text-[10px] font-bold transition-all"
                  >
                    <Trash2 size={12} />
                    Remove Technician
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center shadow-sm">
          <p className="text-slate-400 text-sm font-medium">No lab technicians registered under this hospital directory.</p>
        </div>
      )}

      {/* Onboard Technician Modal */}
      {onboardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Onboard Lab Specialist</h3>
              <button onClick={() => setOnboardModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Full Name</label>
                  <input
                    type="text" required
                    placeholder="e.g. Anand Kumar"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({...onboardForm, name: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Email Address</label>
                  <input
                    type="email" required
                    placeholder="e.g. anand.kumar@arogyacare.com"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({...onboardForm, email: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Contact Phone</label>
                  <input
                    type="text" required
                    placeholder="e.g. +91 9555431234"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({...onboardForm, phone: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Temporary Password</label>
                  <input
                    type="password" required
                    placeholder="Set temporary password..."
                    value={onboardForm.password}
                    onChange={(e) => setOnboardForm({...onboardForm, password: e.target.value})}
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Profile Image */}
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

              {/* Dynamic Tests and Pricing Builder Section */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide">Assign Managed Lab Tests & Pricing</h4>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-slate-400 font-semibold mb-0.5 text-[10px]">Test Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      className="block w-full border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none text-[11px]"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-slate-400 font-semibold mb-0.5 text-[10px]">Category</label>
                    <select
                      value={newTestCategory}
                      onChange={(e) => setNewTestCategory(e.target.value)}
                      className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none text-[11px]"
                    >
                      <option value="Pathology">Pathology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Immunology">Immunology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-slate-400 font-semibold mb-0.5 text-[10px]">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="350"
                      value={newTestPrice}
                      onChange={(e) => setNewTestPrice(e.target.value)}
                      className="block w-full border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none text-[11px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestToOnboard}
                    className="px-3.5 py-1.5 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-hover hover-scale text-[11px]"
                  >
                    + Add
                  </button>
                </div>

                {/* List of Added Tests */}
                {onboardForm.tests && onboardForm.tests.length > 0 && (
                  <div className="border border-slate-100 rounded-2xl p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-slate-50/50">
                    {onboardForm.tests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border border-slate-200/60 px-3 py-1.5 rounded-xl text-[10px]">
                        <div>
                          <span className="font-semibold text-slate-700">{test.test_name}</span>
                          <span className="ml-2 text-slate-400 font-medium">({test.category})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-primary">₹{test.price}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestFromOnboard(index)}
                            className="text-error hover:text-error-text font-bold text-[10px] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  Onboard Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Technicians;
