import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, Sparkles, Loader2, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      error('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      if (res.success) {
        success(`Welcome back, ${res.data.name}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (type) => {
    if (type === 'student') {
      setEmail('alex.rivera@campus.edu');
      setPassword('StudentPassword123!');
    } else if (type === 'admin') {
      setEmail('admin@campus.edu');
      setPassword('AdminPassword123!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FFFBE3]">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-[#53FF73] shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-[#121212]">
              Lost<span className="text-[#334FB4]">Link</span>
            </span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-[#121212] tracking-tight">
            Sign In to Campus Portal
          </h2>
          <p className="text-xs text-[#121212]/70 font-medium">
            Access your lost reports, claim requests, and campus feed.
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-4 bg-[#EFE3FF] border border-[#334FB4]/30 rounded-3xl space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#334FB4] text-center">
            ⚡ 1-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-3 py-2 rounded-full text-xs font-bold text-[#121212] bg-white border border-[#121212] hover:bg-[#53FF73] transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#334FB4]" />
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-2 rounded-full text-xs font-bold text-[#121212] bg-[#F1FF54] border border-[#121212] hover:bg-[#ebfe2c] transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#334FB4]" />
              Demo Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border-2 border-[#121212] shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#121212]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full font-bold text-white bg-[#121212] hover:bg-[#334FB4] transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider text-xs border border-[#121212] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#53FF73]" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#53FF73]" />
                </>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <div className="text-center pt-2 border-t border-[#E5E0D8]">
            <p className="text-xs text-[#121212]/70 font-medium">
              New to LostLink?{' '}
              <Link to="/register" className="font-bold text-[#334FB4] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

