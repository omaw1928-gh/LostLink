import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  Inbox,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  Menu,
  X,
  Search,
  Users,
  Package,
  FileCheck,
  ChevronRight,
  Home
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const studentNavItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Report Lost Item', path: '/report-lost', icon: PlusCircle, badge: 'Lost', badgeColor: 'bg-rose-100 text-rose-700' },
    { label: 'Report Found Item', path: '/report-found', icon: PlusCircle, badge: 'Found', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { label: 'My Reports', path: '/my-reports', icon: Layers },
    { label: 'My Claims', path: '/my-claims', icon: Inbox },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Admin Analytics', path: '/admin', icon: ShieldCheck },
    { label: 'Moderate Items', path: '/admin/items', icon: Package },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Review Claims', path: '/admin/claims', icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-slate-900">
            Lost<span className="text-brand-600">Link</span>
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl md:shadow-none shrink-0`}
      >
        {/* Top Logo & Navigation */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight leading-none block">
                Lost<span className="text-brand-400">Link</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Campus Portal
              </span>
            </div>
          </Link>

          {/* Quick link back to Marketplace */}
          <Link
            to="/browse"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-brand-300 border border-slate-700/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              Browse Campus Feed
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* Student Links */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Student Workspace
            </p>
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !active && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Links */}
          {isAdmin && (
            <div className="space-y-1 pt-4 border-t border-slate-800">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Console
              </p>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/30'
                        : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-950/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-amber-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-300 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.department || 'Student'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb Bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 hidden md:flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-brand-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 capitalize">
              {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report-lost"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              + Lost Item
            </Link>
            <Link
              to="/report-found"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              + Found Item
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
