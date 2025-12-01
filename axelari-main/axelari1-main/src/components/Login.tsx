import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (userId: string, role: string) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('sudhirgiri.g@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setLoading(true);

    try {
      setStatusMessage('Connecting to server...');
      console.log('Attempting login for:', email);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setStatusMessage('Authenticating...');

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || `Authentication failed (${response.status})`);
      }

      if (!data.user || !data.session) {
        throw new Error('Invalid server response');
      }

      setStatusMessage('Setting up session...');

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        console.error('Session setup error:', sessionError);
        throw new Error('Failed to set up session');
      }

      setStatusMessage('Login successful!');

      localStorage.setItem('axelari_user_id', data.user.id);
      localStorage.setItem('axelari_user_role', data.user.role);
      localStorage.setItem('axelari_user_email', data.user.email);

      console.log('Login successful with session, redirecting...');
      onLogin(data.user.id, data.user.role);

    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });

      if (err.name === 'AbortError') {
        setError('Connection timeout. Please check your internet and try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleDirectLogin = async () => {
    setError('');
    setStatusMessage('');
    setLoading(true);

    try {
      setStatusMessage('Looking up user in database...');
      console.log('Bypassing auth, looking up:', email);

      const { data: profile, error: profileError } = await Promise.race([
        supabase
          .from('profiles')
          .select('id, role, full_name')
          .eq('email', email)
          .maybeSingle(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
      ]);

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        throw new Error('Failed to find user: ' + profileError.message);
      }

      if (!profile) {
        throw new Error('No user found with email: ' + email);
      }

      console.log('User found:', profile);
      setStatusMessage('Login successful!');

      localStorage.setItem('axelari_user_id', profile.id);
      localStorage.setItem('axelari_user_role', profile.role);
      localStorage.setItem('axelari_user_email', email);
      localStorage.setItem('axelari_bypass_auth', 'true');

      console.log('Bypass login complete, redirecting...');
      setTimeout(() => {
        onLogin(profile.id, profile.role);
      }, 500);

    } catch (err: any) {
      console.error('Bypass login error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Axelari</h1>
          <p className="text-gray-600">AI-powered adaptive learning platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {statusMessage && !error && (
              <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span>{statusMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleDirectLogin}
              disabled={loading}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {loading ? 'Checking...' : 'Bypass Login (No Password)'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={onSwitchToRegister}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium block w-full"
            >
              Don't have an account? Register here
            </button>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick access options:</p>
              <p className="text-xs text-gray-600 mb-1">Use "Sign In" with password, or</p>
              <p className="text-xs text-gray-600">"Bypass Login" button for instant access</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Personalized learning powered by AI</p>
        </div>
      </div>
    </div>
  );
}
