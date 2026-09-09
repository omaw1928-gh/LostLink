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
    { label: 'Report Lost Item', path: '/report-lost', icon: PlusCircle, badge: 'Lost', badgeColor: 'bg-[#FFD1DC] text-[#121212]' },
    { label: 'Report Found Item', path: '/report-found', icon: PlusCircle, badge: 'Found', badgeColor: 'bg-[#53FF73] text-[#121212]' },
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
    <div className="min-h-screen bg-[#FFFBE3] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#FFFBE3] border-b-2 border-[#121212] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#121212] text-[#53FF73] flex items-center justify-center">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="font-display font-bold text-base text-[#121212]">
            Lost<span className="text-[#334FB4]">Link</span>
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full text-[#121212] hover:bg-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#121212]/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#121212] text-[#FFFBE3] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl md:shadow-none shrink-0 border-r-4 border-[#334FB4]`}
      >
        {/* Top Logo & Navigation */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#53FF73] flex items-center justify-center text-[#121212] shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-[#FFFBE3] tracking-tight leading-none block">
                Lost<span className="text-[#334FB4]">Link</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-[#334FB4] tracking-widest">
                Student Portal
              </span>
            </div>
          </Link>

          {/* Quick link back to Marketplace */}
          <Link
            to="/browse"
            className="flex items-center justify-between px-4 py-2.5 rounded-full bg-[#262626] hover:bg-[#334FB4] text-xs font-bold text-[#FFFBE3] transition-colors border border-[#FFFBE3]/20"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#53FF73]" />
              Browse Campus Feed
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* Student Links */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#334FB4] mb-2">
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
                  className={`flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#334FB4] text-white shadow-md'
                      : 'text-[#FFFBE3]/80 hover:text-white hover:bg-[#262626]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#53FF73]' : 'text-[#FFFBE3]/60'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !active && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Links */}
          {isAdmin && (
            <div className="space-y-1 pt-4 border-t border-[#262626]">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#F1FF54] mb-2 flex items-center gap-1.5">
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
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#F1FF54] text-[#121212] shadow-md'
                        : 'text-[#FFFBE3]/80 hover:text-white hover:bg-[#262626]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#121212]' : 'text-[#F1FF54]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#262626] bg-[#000000]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#EFE3FF] text-[#334FB4] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-[#334FB4]">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#FFFBE3] truncate">{user?.name}</p>
                <p className="text-[10px] text-[#53FF73] font-semibold truncate">{user?.department || 'Student'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-[#FFFBE3]/60 hover:text-rose-400 hover:bg-[#262626] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBE3]">
        {/* Top Breadcrumb Bar */}
        <header className="bg-[#FFFBE3] border-b-2 border-[#121212] px-6 py-4 hidden md:flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-[#121212]/70 font-semibold">
            <Link to="/" className="hover:text-[#334FB4] flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-[#334FB4]" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#121212]/40" />
            <span className="text-[#121212] font-bold capitalize">
              {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/report-lost"
              className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#FFD1DC] text-[#121212] border border-[#121212] hover:bg-[#ffb6c6] transition-colors uppercase tracking-wider"
            >
              + Lost Item
            </Link>
            <Link
              to="/report-found"
              className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#53FF73] text-[#121212] border border-[#121212] hover:bg-[#3eff62] transition-colors uppercase tracking-wider"
            >
              + Found Item
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-[#FFFBE3]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

