import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import logo from '../assets/arogya_logo.jpg';

const Login = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('administrator'); // 'administrator', 'doctor', 'lab_technician'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const authenticatedUser = authData.user;

      // 2. Query corresponding tables to verify role matches database profile
      let roleMatched = false;
      if (role === 'doctor') {
        const { data } = await supabase.from('doctors').select('id').eq('email', authenticatedUser.email).maybeSingle();
        if (data) roleMatched = true;
      } else if (role === 'lab_technician') {
        const { data } = await supabase.from('lab_technicians').select('id').eq('email', authenticatedUser.email).maybeSingle();
        if (data) roleMatched = true;
      } else if (role === 'administrator') {
        const { data } = await supabase.from('hospitals').select('id').eq('admin_email', authenticatedUser.email).maybeSingle();
        if (data) roleMatched = true;
      }

      if (!roleMatched) {
        await supabase.auth.signOut();
        throw new Error(`Access Denied: You are not registered under the ${role === 'lab_technician' ? 'Lab Technician' : role === 'doctor' ? 'Doctor' : 'Hospital Administrator'} roster.`);
      }

      // 3. Navigate or execute SSO redirect
      const currentHost = window.location.hostname;
      const isLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';
      const currentPort = window.location.port;

      let targetRolePort = '5173';
      if (role === 'doctor') targetRolePort = '5174';
      else if (role === 'lab_technician') targetRolePort = '5175';

      // Local Port SSO
      if (isLocal && currentPort === targetRolePort) {
        navigate('/dashboard');
        window.location.reload();
        return;
      }

      // Production SSO Match
      if (!isLocal) {
        const isProductionMatch = 
          (role === 'doctor' && window.location.hostname.includes('doctor')) ||
          (role === 'lab_technician' && window.location.hostname.includes('labtechnician')) ||
          (role === 'administrator' && window.location.hostname.includes('hospitaladmin'));

        if (isProductionMatch) {
          navigate('/dashboard');
          window.location.reload();
          return;
        }
      }

      // Generate SSO redirection link
      let baseUrl = '';
      if (isLocal) {
        if (role === 'doctor') baseUrl = `http://localhost:5174`;
        else if (role === 'lab_technician') baseUrl = `http://localhost:5175`;
        else baseUrl = `http://localhost:5173`;
      } else {
        if (role === 'doctor') baseUrl = `https://arogya-care-doctor.vercel.app`;
        else if (role === 'lab_technician') baseUrl = `https://arogya-care-labtechnician.vercel.app`;
        else baseUrl = `https://arogya-care-hospitaladmin.vercel.app`;
      }

      window.location.href = `${baseUrl}/login-sso?access_token=${authData.session.access_token}&refresh_token=${authData.session.refresh_token}`;

    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'linear-gradient(135deg, rgba(10, 110, 110, 0.04) 0%, rgba(248, 250, 252, 1) 100%)' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center overflow-hidden rounded-3xl w-24 h-24 border border-slate-100 shadow-xl hover-scale bg-white">
            <img src={logo} alt="Arogya Care Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          Arogya Care Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Unified authentication gateway for clinical staff and administration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 sm:rounded-3xl border border-slate-100 sm:px-10">
          
          {/* Segmented Role Selector */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
            {[
              { id: 'administrator', label: 'Admin' },
              { id: 'doctor', label: 'Doctor' },
              { id: 'lab_technician', label: 'Technician' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  setError('');
                }}
                className={`py-2 text-center rounded-xl font-bold text-xs transition-all ${
                  role === r.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-error-bg border border-error/20 p-3 rounded-2xl text-error-text text-xs font-semibold mb-5 flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {role === 'administrator' ? 'Admin' : role === 'doctor' ? 'Doctor' : 'Technician'} Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'administrator' ? 'e.g. apollo_admin@apollo.com' : role === 'doctor' ? 'e.g. dr.sharma@arogya.com' : 'e.g. tech.anil@arogya.com'}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Login button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-hover hover-scale transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Authenticating Role...
                  </>
                ) : (
                  `Sign In as ${role === 'administrator' ? 'Admin' : role === 'doctor' ? 'Doctor' : 'Technician'}`
                )}
              </button>
            </div>
          </form>

          {/* Sign up option */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs font-semibold text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline font-bold">
              Sign Up / Register Hospital
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
