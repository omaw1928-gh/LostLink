import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItems } from '../services/itemService';
import { getMyClaims } from '../services/claimService';
import StatCard from '../components/StatCard';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Layers,
  Search,
  CheckCircle,
  Clock,
  PlusCircle,
  Inbox,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Package
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [claimsData, setClaimsData] = useState({ submitted: [], received: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [itemsRes, claimsRes] = await Promise.all([
          getItems({ reportedBy: user?._id, limit: 100 }),
          getMyClaims(),
        ]);

        if (itemsRes.success) {
          setMyItems(itemsRes.data);
        }
        if (claimsRes.success) {
          setClaimsData(claimsRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner text="Loading your campus dashboard..." />;
  }

  // Calculate statistics
  const totalReports = myItems.length;
  const lostCount = myItems.filter((i) => i.type === 'lost').length;
  const foundCount = myItems.filter((i) => i.type === 'found').length;
  const recoveredCount = myItems.filter((i) => i.status === 'resolved' || i.status === 'claimed').length;
  const pendingReceivedClaims = claimsData.received.filter((c) => c.status === 'pending');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Member Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-300">
            Track your lost items, review incoming claims, and manage found reports all in one place.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/report-lost"
            className="px-5 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Pending Claims Alert Banner (if any) */}
      {pendingReceivedClaims.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                You have {pendingReceivedClaims.length} pending claim{pendingReceivedClaims.length > 1 ? 's' : ''} awaiting your review!
              </p>
              <p className="text-xs text-amber-700">A student submitted verification proof for an item you reported.</p>
            </div>
          </div>
          <Link
            to="/my-claims"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shrink-0"
          >
            Review Claims
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Reports"
          value={totalReports}
          icon={Layers}
          color="blue"
          subtitle="Your campus submissions"
        />
        <StatCard
          title="Lost Items"
          value={lostCount}
          icon={Search}
          color="rose"
          subtitle="Items you are looking for"
        />
        <StatCard
          title="Found Items"
          value={foundCount}
          icon={Package}
          color="brand"
          subtitle="Belongings you reported found"
        />
        <StatCard
          title="Recovered"
          value={recoveredCount}
          icon={CheckCircle}
          color="amber"
          subtitle="Resolved & returned"
        />
      </div>

      {/* Recent Submissions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Recent Reports</h2>
          <Link
            to="/my-reports"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            View all reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myItems.slice(0, 4).map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            You haven't reported any lost or found items yet.
          </div>
        )}
      </div>

      {/* Claims Snapshot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims Received on My Items */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">Incoming Claims</h3>
            </div>
            <Link to="/my-claims" className="text-xs font-bold text-brand-600 hover:underline">
              Manage
            </Link>
          </div>

          {claimsData.received.length > 0 ? (
            <div className="space-y-3">
              {claimsData.received.slice(0, 3).map((claim) => (
                <div
                  key={claim._id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                      {claim.claimant?.name || 'Student'} claimed "{claim.item?.title}"
                    </p>
                    <p className="text-slate-500 truncate mt-0.5">{claim.message}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize shrink-0 ${
                      claim.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No claims received on your reported items.
            </p>
          )}
        </div>

        {/* Claims I Submitted */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Claims You Submitted</h3>
            </div>
            <Link to="/my-claims" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {claimsData.submitted.length > 0 ? (
            <div className="space-y-3">
              {claimsData.submitted.slice(0, 3).map((claim) => (
                <div
                  key={claim._id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                      Claim on "{claim.item?.title || 'Reported Item'}"
                    </p>
                    <p className="text-slate-500 truncate mt-0.5">
                      Reported by {claim.item?.reportedBy?.name || 'Campus Member'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize shrink-0 ${
                      claim.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              You haven't submitted any claim requests yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
