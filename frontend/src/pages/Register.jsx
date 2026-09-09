import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Calendar,
  Loader2,
  ArrowRight
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Biomedical Sciences',
  'Business Administration',
  'Architecture & Design',
  'Humanities & Social Sciences',
  'Mathematics & Physics',
  'General',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate / Postgrad', 'Faculty / Staff'];

const Register = () => {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        success(`Account created! Welcome to LostLink, ${res.data.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FFFBE3]">
      <div className="max-w-xl w-full space-y-6">
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
            Create Student / Campus Account
          </h2>
          <p className="text-xs text-[#121212]/70 font-medium">
            Join the verified campus network to report and recover lost belongings.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-8 rounded-3xl border-2 border-[#121212] shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none transition-all"
                  required
                />
                <User className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
                  Campus Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@campus.edu"
                    className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none transition-all"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Phone & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
                  Phone Number <span className="text-[#121212]/50 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
                  Academic Year
                </label>
                <div className="relative">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none appearance-none transition-all"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <Calendar className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
                Department / Major
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFBE3] border border-[#121212] rounded-2xl text-xs text-[#121212] font-semibold focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none appearance-none transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-full font-bold text-white bg-[#121212] hover:bg-[#334FB4] transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider text-xs border border-[#121212] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#53FF73]" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 text-[#53FF73]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom link */}
          <div className="text-center pt-2 border-t border-[#E5E0D8]">
            <p className="text-xs text-[#121212]/70 font-medium">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#334FB4] hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

