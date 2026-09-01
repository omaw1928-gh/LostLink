import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../services/adminService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Package,
  Search,
  CheckCircle2,
  FileCheck,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getAdminStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling campus administration analytics..." />;
  }

  const { users, items, claims, categoryBreakdown, recentItems, recentUsers } = stats || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus LostLink Overview
          </h1>
          <p className="text-sm text-white/90">
            Monitor system activities, moderate inappropriate submissions, and oversee campus claim resolution.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/items"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all"
          >
            Moderate Items
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900/80 hover:bg-slate-900 shadow-md transition-all"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={users?.total || 0}
          icon={Users}
          color="blue"
          subtitle={`${users?.students || 0} Students • ${users?.admins || 0} Admins`}
        />
        <StatCard
          title="Total Reports"
          value={items?.total || 0}
          icon={Package}
          color="brand"
          subtitle={`${items?.lost || 0} Lost • ${items?.found || 0} Found`}
        />
        <StatCard
          title="Recovered / Claimed"
          value={(items?.resolved || 0) + (items?.claimed || 0)}
          icon={CheckCircle2}
          color="amber"
          subtitle={`${items?.resolved || 0} Resolved Cases`}
        />
        <StatCard
          title="Pending Claims"
          value={claims?.pending || 0}
          icon={Clock}
          color="rose"
          subtitle={`${claims?.total || 0} Total Claims Submitted`}
        />
      </div>

      {/* Breakdown & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center justify-between">
            <span>Category Breakdown</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </h3>

          <div className="space-y-3">
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((cat) => {
                const percentage = Math.round((cat.count / (items?.total || 1)) * 100);
                return (
                  <div key={cat.category} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{cat.category}</span>
                      <span className="text-slate-500">
                        {cat.count} items ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No categories recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Items Table */}
        <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Recent Campus Reports</h3>
            <Link to="/admin/items" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentItems && recentItems.length > 0 ? (
                  recentItems.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-semibold text-slate-900 truncate max-w-[180px]">
                        {item.title}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            item.type === 'lost'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{item.category}</td>
                      <td className="p-3 text-slate-500 truncate max-w-[140px]">{item.location}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold capitalize text-[10px] ${
                            item.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'claimed'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-400">
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
