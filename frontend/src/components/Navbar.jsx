import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Search,
  PlusCircle,
  Menu,
  X,
  User,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  Inbox,
  ArrowRight
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200 shadow-sm">
      {/* Moxie Top Announcement Ticker */}
      <div className="bg-[#121212] text-[#FFFBE3] text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-[#262626]">
        <span className="bg-[#334FB4] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
          Live Updates
        </span>
        <span className="truncate">
          100% Verified Campus Recovery Platform • Report lost items or claim found belongings instantly!
        </span>
        <Link to="/browse" className="hidden sm:inline-flex items-center gap-1 font-semibold text-[#53FF73] hover:underline ml-1">
          Explore Items <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Moxie Navbar */}
      <div className="bg-[#FFFBE3] border-b border-[#E5E0D8]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-[#53FF73] shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight text-[#121212] leading-none">
                  Lost<span className="text-[#334FB4]">Link</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#334FB4] mt-0.5">
                  Campus Recovery System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1.5 rounded-full border border-[#E5E0D8]">
              <Link
                to="/"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive('/')
                    ? 'bg-[#121212] text-[#FFFBE3] shadow-sm'
                    : 'text-[#121212] hover:bg-[#F3F3F3]'
                }`}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                  isActive('/browse')
                    ? 'bg-[#334FB4] text-white shadow-sm'
                    : 'text-[#121212] hover:bg-[#F3F3F3]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Browse Items
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-[#121212] text-[#FFFBE3] shadow-sm'
                      : 'text-[#121212] hover:bg-[#F3F3F3]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Actions & Profile */}
            <div className="hidden md:flex items-center gap-2.5">
              <Link
                to="/report-lost"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#121212] bg-[#FFD1DC] hover:bg-[#ffb6c6] border border-[#121212]/10 transition-all duration-200 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#121212]" />
                Report Lost
              </Link>
              <Link
                to="/report-found"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#121212] bg-[#53FF73] hover:bg-[#3eff62] border border-[#121212]/10 transition-all duration-200 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#121212]" />
                Report Found
              </Link>

              <div className="h-5 w-[1px] bg-[#E5E0D8] mx-1" />

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border border-[#121212] bg-white hover:bg-[#FFFBE3] transition-all shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#334FB4] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-[#121212] leading-tight truncate max-w-[90px]">
                        {user?.name}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#121212]" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-[#121212] py-2 z-20 animate-fade-in divide-y divide-slate-100">
                        <div className="px-4 py-2.5 bg-[#EFE3FF]/50 rounded-t-xl">
                          <p className="text-[10px] uppercase font-bold text-[#334FB4] tracking-wider">Signed in as</p>
                          <p className="text-xs font-semibold text-[#121212] truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase bg-[#53FF73] text-[#121212] rounded-full">
                            {user?.role} Account
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#121212] hover:bg-[#FFFBE3] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#334FB4]" />
                            Student Dashboard
                          </Link>
                          <Link
                            to="/my-reports"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#121212] hover:bg-[#FFFBE3] transition-colors"
                          >
                            <Layers className="w-4 h-4 text-[#334FB4]" />
                            My Reports
                          </Link>
                          <Link
                            to="/my-claims"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#121212] hover:bg-[#FFFBE3] transition-colors"
                          >
                            <Inbox className="w-4 h-4 text-[#334FB4]" />
                            My Claims
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#121212] hover:bg-[#FFFBE3] transition-colors"
                          >
                            <User className="w-4 h-4 text-[#334FB4]" />
                            My Profile
                          </Link>
                        </div>

                        {isAdmin && (
                          <div className="py-1 bg-[#F1FF54]/30">
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#121212] hover:bg-[#F1FF54] transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-[#334FB4]" />
                              Admin Console
                            </Link>
                          </div>
                        )}

                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#121212] hover:bg-[#F3F3F3] border border-[#121212]/20 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#121212] hover:bg-[#334FB4] shadow-sm transition-all hover:scale-[1.02]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full text-[#121212] hover:bg-[#F3F3F3] focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#121212] bg-[#FFFBE3] px-4 pt-4 pb-6 space-y-3 animate-fade-in shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/report-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#121212] bg-[#FFD1DC] border border-[#121212]"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost
            </Link>
            <Link
              to="/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#121212] bg-[#53FF73] border border-[#121212]"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found
            </Link>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:bg-white"
            >
              Home
            </Link>
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:bg-white"
            >
              Browse All Items
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:bg-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:bg-white"
                >
                  My Reports
                </Link>
                <Link
                  to="/my-claims"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:bg-white"
                >
                  My Claims
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:bg-white"
                >
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#121212] bg-[#F1FF54]"
                  >
                    Admin Console
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E0D8]">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-full text-xs font-bold text-[#121212] border border-[#121212] bg-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-full text-xs font-bold text-white bg-[#121212]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

