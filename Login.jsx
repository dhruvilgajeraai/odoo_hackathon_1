import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Lock, Mail, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      await login({ email: demoEmail, password: demoPassword });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 via-brand-50/30 to-slate-100">
      <div className="max-w-md w-full">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
          {/* Circular Logo / Photo Placeholder */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-500 p-1 shadow-lg shadow-orange-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <Compass className="w-10 h-10 text-brand-600 animate-spin-slow" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">GlobeTrotter India 🇮🇳</h1>
            <p className="text-sm text-slate-500">Sign in to plan, organize, and track your Indian adventures</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center space-x-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address / Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@globetrotter.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-adventure-500 to-amber-500 hover:from-adventure-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-adventure-500/25 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">1-Click Indian Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('rahul@globetrotter.in', 'Rahul@123')}
                className="flex items-center justify-center space-x-1.5 p-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Demo Traveler</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('priya@globetrotter.in', 'Priya@123')}
                className="flex items-center justify-center space-x-1.5 p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-xl text-xs font-semibold text-amber-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Priya</span>
              </button>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center pt-2 text-xs font-medium text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500">
              Enter your email address and we will send you instructions to reset your password.
            </p>
            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reset link sent! Please check your inbox.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="rahul@globetrotter.in"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setResetSuccess(true)}
                  className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  Send Reset Link
                </button>
              </div>
            )}
            <button
              onClick={() => { setForgotModalOpen(false); setResetSuccess(false); }}
              className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
