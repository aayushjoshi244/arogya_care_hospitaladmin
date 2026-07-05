import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitalStatus, setHospitalStatus] = useState(''); // 'APPROVED', 'PENDING', etc.
  const [isRegistered, setIsRegistered] = useState(false);
  const [hospLoading, setHospLoading] = useState(true);

  const fetchHospitalProfile = async (currentUser) => {
    if (!currentUser) {
      setHospitalStatus('');
      setIsRegistered(false);
      setHospLoading(false);
      return;
    }
    setHospLoading(true);
    try {
      const res = await api.get('/profile');
      if (res.success) {
        setIsRegistered(res.registered);
        setHospitalStatus(res.status || '');
      } else {
        setIsRegistered(false);
        setHospitalStatus('');
      }
    } catch (err) {
      console.error('Failed to load hospital profile in AuthProvider:', err.message);
      setIsRegistered(false);
      setHospitalStatus('');
    } finally {
      setHospLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchHospitalProfile(currentUser);
      } else {
        setHospLoading(false);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth shifts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchHospitalProfile(currentUser);
      } else {
        setIsRegistered(false);
        setHospitalStatus('');
        setHospLoading(false);
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      await fetchHospitalProfile(data.user);
      return data.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setIsRegistered(false);
      setHospitalStatus('');
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchHospitalProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      logout, 
      isLoading, 
      hospitalStatus, 
      isRegistered, 
      hospLoading, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
