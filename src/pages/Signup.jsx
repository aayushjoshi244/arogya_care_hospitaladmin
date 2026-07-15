import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import logo from '../assets/arogya_logo.jpg';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [facilityType, setFacilityType] = useState('HOSPITAL'); // 'HOSPITAL' or 'LAB'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions of Arogya Care to register');
      return;
    }

    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'hospital_admin', // Set metadata role
            facility_type: facilityType // Track if it's lab or hospital
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        // Automatically logged in
        setMessage('Registration successful! Redirecting to setup...');
        setTimeout(() => {
          if (facilityType === 'LAB') {
            navigate('/register-lab');
          } else {
            navigate('/register-hospital');
          }
        }, 1000);
      } else {
        // Email verification required
        setMessage('Check your email inbox for a verification link to activate your account!');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAcceptedTerms(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign up. Try again.');
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
          Register Facility Admin
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Create an administrative account to enroll your hospital or lab center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 sm:rounded-3xl border border-slate-100 sm:px-10">
          
          {/* Segmented Switcher for Facility Type */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-200/65 p-1 rounded-2xl mb-6">
            {[
              { id: 'HOSPITAL', label: 'Hospital' },
              { id: 'LAB', label: 'Diagnostic Lab' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFacilityType(f.id)}
                className={`py-2 px-3 text-center rounded-xl font-extrabold text-xs transition-all ${
                  facilityType === f.id
                    ? 'bg-primary text-white shadow-md scale-[1.02]'
                    : 'text-slate-650 hover:text-slate-800 hover:bg-slate-300/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-error-bg border border-error/20 p-3 rounded-2xl text-error-text text-xs font-semibold mb-5 flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="bg-success-bg border border-success/20 p-3 rounded-2xl text-success-text text-xs font-semibold mb-5 flex items-center gap-2.5">
              <ShieldCheck size={16} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Administrator Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@apollohospitals.com"
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2 mt-4 select-none">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded transition-all cursor-pointer"
              />
              <label htmlFor="acceptTerms" className="text-xs text-slate-500 font-semibold cursor-pointer leading-tight">
                I accept the{' '}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="text-primary hover:underline font-extrabold"
                >
                  Terms & Conditions of Arogya Care
                </button>{' '}
                for center verification and compliance checks.
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-hover hover-scale transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Credentials...
                  </>
                ) : (
                  'Sign Up Account'
                )}
              </button>
            </div>
          </form>

          {/* Log in option */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs font-semibold text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </div>

        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {termsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Arogya Care Compliance Policy</h3>
            </div>
            <div className="space-y-3.5 text-xs text-slate-600 max-h-[300px] overflow-y-auto pr-1 leading-relaxed font-semibold">
              <p>
                Welcome to Arogya Care. By enrolling your medical establishment on this dashboard, you confirm that you are the authorized representative or administrator of the hospital center.
              </p>
              <p className="font-extrabold text-slate-850 mt-2">
                🔐 HIPAA Compliance & Security Auditing
              </p>
              <p>
                All administrative credentials, governmental clinical license certificates, PAN cards, GST filings, owner details, and administrator ID proofs (including Aadhaar details) are collected strictly for the purpose of compliance auditing and verification of hospital credentials.
              </p>
              <p>
                These files are encrypted in transit and at rest using AES-256 standard protocols and saved inside dedicated restricted Cloudinary vaults. They are not used for clinical profiles or public queries and are audited strictly by Arogya Care Super Administrators.
              </p>
              <p className="font-extrabold text-slate-850 mt-2">
                🇮🇳 Indian Clinical Establishment Act & Privacy Laws
              </p>
              <p>
                All registrations are audited in accordance with the Clinical Establishments Act and the Digital Personal Health Information protection frameworks of India. Hospital profiles are subject to review, suspension, or approval by authorized auditors at any time.
              </p>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-50">
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setTermsModalOpen(false);
                }}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold hover-scale transition-all"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
