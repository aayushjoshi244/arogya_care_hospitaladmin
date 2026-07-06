import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Pill, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  AlertCircle,
  Activity,
  Info
} from 'lucide-react';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State (persisted in localStorage)
  const [medName, setMedName] = useState(() => localStorage.getItem('arogya_med_name') || '');
  const [dosageType, setDosageType] = useState(() => localStorage.getItem('arogya_med_dosage') || 'Tablet');
  const [price, setPrice] = useState(() => localStorage.getItem('arogya_med_price') || '');
  const [stock, setStock] = useState(() => localStorage.getItem('arogya_med_stock') || '');

  useEffect(() => {
    localStorage.setItem('arogya_med_name', medName);
  }, [medName]);

  useEffect(() => {
    localStorage.setItem('arogya_med_dosage', dosageType);
  }, [dosageType]);

  useEffect(() => {
    localStorage.setItem('arogya_med_price', price);
  }, [price]);

  useEffect(() => {
    localStorage.setItem('arogya_med_stock', stock);
  }, [stock]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/medicines');
      if (res.success) {
        setMedicines(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch medicines directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!medName || !price) {
      setError('Please provide a medicine name and price.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/medicines', {
        medicine_name: medName,
        dosage_type: dosageType,
        price: parseFloat(price),
        stock_quantity: parseInt(stock) || 0
      });

      if (res.success) {
        setMedicines(prev => [...prev, res.data]);
        setMedName('');
        setPrice('');
        setStock('');
        localStorage.removeItem('arogya_med_name');
        localStorage.removeItem('arogya_med_price');
        localStorage.removeItem('arogya_med_stock');
        setSuccessMsg('Medicine catalog item added successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add medicine item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medicine item?')) return;
    try {
      const res = await api.delete(`/medicines/${id}`);
      if (res.success) {
        setMedicines(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete medicine item.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Pharmacy Directory & Stock</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage stocked medications, dosage forms, pricing, and available quantities.</p>
        </div>
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
          <Pill size={22} />
        </div>
      </div>

      {/* Info notice about future implementation */}
      <div className="bg-emerald-50 border border-emerald-200/50 p-5 rounded-3xl text-emerald-800 flex items-start gap-4 shadow-sm shadow-emerald-100/30">
        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0 mt-0.5">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-xs tracking-tight text-slate-800">Prescription Routing & Inventory Optimization</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            This pharmacy inventory data is collected to facilitate future automated prescription routing, real-time inventory management, and smart fulfillment integrations with partner clinics. Providing this data now will help optimize patient lookup speeds later.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-error-bg border border-error/20 p-4 rounded-xl text-error-text text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-success-bg border border-success/20 p-4 rounded-xl text-success-text text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <Check size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Add Medicine Form */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Add Medication Catalog</h3>
          
          <form onSubmit={handleAddMedicine} className="space-y-4 text-xs font-semibold text-slate-500">
            <div>
              <label className="block uppercase tracking-wider mb-1 text-[10px] text-slate-400 font-bold">Medication Name</label>
              <input 
                type="text" 
                required
                value={medName}
                onChange={e => setMedName(e.target.value)}
                placeholder="e.g. Paracetamol 500mg"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider mb-1 text-[10px] text-slate-400 font-bold">Dosage Type</label>
              <select 
                value={dosageType}
                onChange={e => setDosageType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-semibold"
              >
                <option value="Tablet">Tablet</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Capsule">Capsule</option>
                <option value="Suspension">Suspension</option>
                <option value="Ointment">Ointment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider mb-1 text-[10px] text-slate-400 font-bold">Price (₹)</label>
                <input 
                  type="number" 
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 15.50"
                  step="0.01"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1 text-[10px] text-slate-400 font-bold">Stock Qty</label>
                <input 
                  type="number" 
                  required
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-1.5 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-primary/10 text-xs font-bold text-white bg-primary hover:bg-primary-hover hover-scale transition-all focus:outline-none disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Adding Medicine...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Add to Stock</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Active Medicines List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Medication Stock list ({medicines.length})</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
              <p className="text-[11px] text-slate-400 mt-2 font-medium">Fetching medicine catalog...</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-250/60 rounded-2xl">
              <Activity size={28} className="text-slate-300" />
              <p className="text-xs font-semibold mt-2">No medications cataloged yet.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Use the config form on the left to set up medicines.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-500">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Medicine Details</th>
                    <th className="px-4 py-3">Form</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock Count</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/40 text-slate-700">
                  {medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-slate-800 block text-xs">{med.medicine_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] uppercase tracking-wider font-bold">
                          {med.dosage_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        ₹{parseFloat(med.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${med.stock_quantity > 50 ? 'text-slate-700' : 'text-error-text'}`}>
                          {med.stock_quantity.toLocaleString()} units
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteMedicine(med.id)}
                          className="p-1.5 text-slate-400 hover:text-error hover:bg-error-bg rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Medicines;
