import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Compass,
  FileText,
  UserCheck2,
  Navigation,
  LocateFixed
} from 'lucide-react';

const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) {
    throw new Error('Cloudinary upload failed');
  }
  const data = await res.json();
  return data.secure_url;
};

const ImageUploadField = ({ label, value, onChange, uploading, error }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="block text-slate-500 font-bold uppercase mb-1">{label}</label>
      <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors">
        <input 
          type="file" 
          accept="image/*"
          disabled={uploading}
          onChange={onChange}
          className="text-xs font-semibold text-slate-550 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary file:hover:bg-primary/20 file:cursor-pointer transition-colors"
        />
        {uploading && (
          <div className="flex items-center gap-2">
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-1.5 animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <span className="text-[10px] text-primary font-bold shrink-0">Uploading...</span>
          </div>
        )}
        {!uploading && value && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-success-text text-[10px] font-bold bg-success-bg/40 px-2 py-0.5 rounded-md">
              <CheckCircle2 size={12} className="shrink-0" />
              <span>Uploaded to Cloudinary</span>
            </div>
            <img 
              src={value} 
              alt="Preview" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Settings = () => {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [syncingCoords, setSyncingCoords] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Editable Form fields
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    google_maps_link: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.get('/profile');
      if (res.success && res.data) {
        setHospital(res.data);
        setFormData({
          address: res.data.address || '',
          city: res.data.city || '',
          state: res.data.state || '',
          pincode: res.data.pincode || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          website: res.data.website || '',
          google_maps_link: res.data.google_maps_link || '',
          owner_name: res.data.owner_name || '',
          owner_phone: res.data.owner_phone || '',
          owner_email: res.data.owner_email || '',
          image_url: res.data.image_url || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch hospital registration profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setMessage('');
    try {
      const res = await api.put('/profile', formData);
      if (res.success) {
        setMessage('Hospital profile coordinates and contact details updated successfully.');
        setHospital(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile details');
    } finally {
      setUpdating(false);
    }
  };

  const handleSyncCoords = async () => {
    setSyncingCoords(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/profile/backfill-coords');
      if (res.success) {
        setMessage(`📍 Location synced successfully! Coordinates extracted from your Google Maps link and saved to the database. The Nearby feature in the patient app will now work correctly.`);
        setHospital(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to extract coordinates from the Google Maps link. Make sure the link is a valid Google Maps URL.');
    } finally {
      setSyncingCoords(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-slate-500 font-medium mt-3">Loading hospital configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hospital Configuration</h2>
        <p className="text-slate-400 text-sm font-medium mt-0.5">Edit contact parameters, update geo-coordinates, and view verification licenses</p>
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

      {/* Grid: Left Form, Right Document check */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/50 space-y-5">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              General Details & Address
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              {/* Grid 1: Basic contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Public Phone Line</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +91 80 4721 1111"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Public Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g. info@apollohospitals.com"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-bold uppercase mb-1">Website URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="e.g. https://www.apollohospitals.com"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid 2: Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                <div className="sm:col-span-3">
                  <label className="block text-slate-500 font-bold uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="e.g. 154/11, Bannerghatta Road"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Bengaluru"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="Karnataka"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    placeholder="560076"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid 3: Geo Maps coordinates link */}
              <div className="grid grid-cols-1 gap-4 border-t border-slate-50 pt-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                    <Compass size={14} className="text-primary" />
                    Google Maps Link
                  </label>
                  <input
                    type="text"
                    value={formData.google_maps_link}
                    onChange={(e) => setFormData({...formData, google_maps_link: e.target.value})}
                    placeholder="e.g. https://maps.app.goo.gl/abcdefg12345"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                  {/* Sync Location Button */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      {hospital?.latitude && hospital?.longitude ? (
                        <span className="flex items-center gap-1 text-[10px] text-success-text font-bold bg-success-bg/50 px-2 py-1 rounded-lg">
                          <LocateFixed size={10} />
                          Synced: {parseFloat(hospital.latitude).toFixed(4)}, {parseFloat(hospital.longitude).toFixed(4)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                          <MapPin size={10} />
                          No coordinates — Nearby won't work
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncCoords}
                      disabled={syncingCoords || !formData.google_maps_link}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-bold rounded-lg text-[10px] hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Navigation size={11} />
                      {syncingCoords ? 'Syncing...' : 'Sync Location from Maps Link'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid 3.5: Facility Image */}
              <div className="border-t border-slate-50 pt-4">
                <ImageUploadField 
                  label="Facility Photo" 
                  value={formData.image_url}
                  uploading={uploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploadingImage(true);
                    setError('');
                    try {
                      const url = await uploadToCloudinary(file);
                      setFormData({...formData, image_url: url});
                    } catch (err) {
                      setError('Facility photo upload failed: ' + err.message);
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              </div>

              {/* Grid 4: Owner details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                <div className="sm:col-span-3">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-xs">
                    <UserCheck2 size={14} className="text-primary" />
                    Hospital Owner Information
                  </h4>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Owner Phone</label>
                  <input
                    type="text"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                    placeholder="e.g. +91 98765 43210"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                    placeholder="e.g. rajesh@apollo.com"
                    className="block w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-850 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={updating || uploadingImage}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover-scale shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={14} />
                  {updating ? 'Saving Changes...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Info: Read-only verification details */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Verification Scope</h3>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-success-text shrink-0" />
              <span className="text-xs font-bold text-slate-700">Verified Platform Tenant</span>
            </div>
            
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              License documents and audit records have been verified by Super Administrators. Core parameters cannot be updated without a support request.
            </p>
          </div>

          {/* Read Only Details */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 space-y-3.5 text-xs text-slate-700">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">Registered Details</h3>
            
            <div className="space-y-2.5 font-semibold">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Center Name</p>
                <p className="text-slate-800 font-extrabold mt-0.5">{hospital?.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Registration Number</p>
                <p className="text-slate-700 mt-0.5">{hospital?.registration_number}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Established Year</p>
                <p className="text-slate-700 mt-0.5">{hospital?.established_year}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Hospital ID</p>
                <p className="text-primary font-extrabold mt-0.5">{hospital?.hospital_id}</p>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shadow-slate-100/50 space-y-3.5 text-xs text-slate-700">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">Compliance Documents</h3>
            
            <div className="space-y-2">
              {hospital?.license_document_url && (
                <a
                  href={hospital.license_document_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover-scale animate-in fade-in duration-200"
                >
                  <FileText size={16} className="text-primary shrink-0" />
                  <span className="font-bold text-slate-650 truncate">Hospital License</span>
                </a>
              )}
              {hospital?.pan_document_url && (
                <a
                  href={hospital.pan_document_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover-scale animate-in fade-in duration-200"
                >
                  <FileText size={16} className="text-blue-500 shrink-0" />
                  <span className="font-bold text-slate-650 truncate">PAN Document</span>
                </a>
              )}
              {hospital?.gst_document_url && (
                <a
                  href={hospital.gst_document_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover-scale animate-in fade-in duration-200"
                >
                  <FileText size={16} className="text-success-text shrink-0" />
                  <span className="font-bold text-slate-650 truncate">GST Registration</span>
                </a>
              )}
              {hospital?.admin_aadhaar_url && (
                <a
                  href={hospital.admin_aadhaar_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover-scale animate-in fade-in duration-200"
                >
                  <FileText size={16} className="text-purple-500 shrink-0" />
                  <span className="font-bold text-slate-650 truncate">Admin Aadhaar Scan</span>
                </a>
              )}
              {hospital?.admin_id_card_url && (
                <a
                  href={hospital.admin_id_card_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover-scale animate-in fade-in duration-200"
                >
                  <FileText size={16} className="text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-650 truncate">Admin Hospital ID</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
