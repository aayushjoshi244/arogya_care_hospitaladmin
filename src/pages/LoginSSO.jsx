import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const LoginSSO = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleSSO = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        setError('Missing SSO authentication tokens.');
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        setError(`SSO Session setup failed: ${sessionError.message}`);
      } else {
        // Successful login, navigate to home/dashboard
        navigate('/dashboard', { replace: true });
        window.location.reload();
      }
    };

    handleSSO();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      {error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-3xl text-red-800 text-center max-w-sm">
          <p className="font-bold">SSO Authentication Error</p>
          <p className="text-xs mt-2">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-slate-500 font-medium">Establishing secure clinical session...</p>
        </div>
      )}
    </div>
  );
};

export default LoginSSO;
