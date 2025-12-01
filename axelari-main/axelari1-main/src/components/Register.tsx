import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RegisterProps {
  onRegister: (userId: string, role: string) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'teacher' | 'parent' | 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration via edge function');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-register`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          role: formData.role,
        }),
      });

      const data = await response.json();

      console.log('Registration response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      if (data.user && data.session) {
        console.log('Registration successful');

        if (formData.role === 'student') {
          await supabase.from('learning_paths').insert({
            student_id: data.user.id,
            current_phase: 1,
            learning_speed: 'medium',
            cognitive_profile: {}
          });
        }

        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        setSuccess(true);
        setTimeout(() => {
          onRegister(data.user.id, data.user.role);
        }, 1500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting direct registration with Supabase');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            role: formData.role,
          },
        },
      });

      if (authError) {
        console.error('Direct registration auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Registration failed - no user returned');
      }

      console.log('User created, creating profile...');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create profile: ' + profileError.message);
      }

      console.log('Profile created successfully');

      if (formData.role === 'student') {
        console.log('Creating learning path for student...');
        const { error: lpError } = await supabase.from('learning_paths').insert({
          student_id: authData.user.id,
          current_phase: 1,
          learning_speed: 'medium',
          cognitive_profile: {}
        });

        if (lpError) {
          console.warn('Learning path creation error:', lpError);
        }
      }

      if (authData.session) {
        await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onRegister(authData.user.id, formData.role);
      }, 1500);

    } catch (err: any) {
      console.error('Direct registration error:', err);
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Axelari</h1>
          <p className="text-gray-600">Start your personalized learning journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Created!</h3>
              <p className="text-gray-600">Redirecting you to the platform...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={handleDirectRegister}
                disabled={loading}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-3"
              >
                {loading ? 'Creating...' : 'Try Direct Registration (Debug)'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
