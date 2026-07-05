import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  AlertCircle,
  Activity
} from 'lucide-react';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [testName, setTestName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Pathology');

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/lab-tests');
      if (res.success) {
        setTests(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch lab tests list.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    if (!testName || !price) {
      setError('Please provide a test name and price.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/lab-tests', {
        test_name: testName,
        price: parseFloat(price),
        category
      });

      if (res.success) {
        setTests(prev => [...prev, res.data]);
        setTestName('');
        setPrice('');
        setSuccessMsg('Lab test added successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add lab test.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to remove this lab test?')) return;
    try {
      const res = await api.delete(`/lab-tests/${id}`);
      if (res.success) {
        setTests(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete lab test.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Diagnostics & Lab Directory</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage the medical lab tests and pricing tiers offered by your center.</p>
        </div>
        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
          <FlaskConical size={22} />
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
        
        {/* Left: Add Test Form */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Configure New Test</h3>
          
          <form onSubmit={handleAddTest} className="space-y-4 text-xs font-semibold text-slate-500">
            <div>
              <label className="block uppercase tracking-wider mb-1 text-[10px] text-slate-400 font-bold">Test Name</label>
              <input 
                type="text" 
                required
                value={testName}
                onChange={e => setTestName(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC)"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider mb-1 text-[10px] text-slate-400 font-bold">Category</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-semibold"
                >
                  <option value="Pathology">Pathology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1 text-[10px] text-slate-400 font-bold">Price (₹)</label>
                <input 
                  type="number" 
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 450"
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
                  <span>Adding Test...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Add Lab Test</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Active Test List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Active Offerings ({tests.length})</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
              <p className="text-[11px] text-slate-400 mt-2 font-medium">Fetching lab records...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-250/60 rounded-2xl">
              <Activity size={28} className="text-slate-300" />
              <p className="text-xs font-semibold mt-2">No diagnostics added yet.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Use the config form on the left to set up tests.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-500">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Test Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/40 text-slate-700">
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-slate-800 block text-xs">{test.test_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] uppercase tracking-wider font-bold">
                          {test.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        ₹{parseFloat(test.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteTest(test.id)}
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

export default LabTests;
