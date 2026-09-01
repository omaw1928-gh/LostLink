import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  Send,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Share2,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { getItemById, deleteItem, updateItemStatus } from '../services/itemService';
import { updateClaimStatus } from '../services/claimService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ClaimModal from '../components/ClaimModal';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getItemById(id);
      if (res.success) {
        setItem(res.data);
        setClaims(res.claims || []);
      }
    } catch (err) {
      error('Failed to load item details');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const isOwner = user && item?.reportedBy && (user._id === item.reportedBy._id || user._id === item.reportedBy);
  const canManage = isOwner || isAdmin;
  const isLost = item?.type === 'lost';

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await deleteItem(item._id);
      if (res.success) {
        success('Item report deleted successfully');
        navigate('/browse');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateItemStatus(item._id, newStatus);
      if (res.success) {
        success(`Item marked as ${newStatus}`);
        fetchDetails();
      }
    } catch (err) {
      error('Failed to update status');
    }
  };

  const handleClaimDecision = async (claimId, decisionStatus) => {
    try {
      const res = await updateClaimStatus(claimId, decisionStatus);
      if (res.success) {
        success(`Claim ${decisionStatus}`);
        fetchDetails();
      }
    } catch (err) {
      error('Failed to update claim');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    info('Item link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner text="Fetching item details..." />;
  }

  if (!item) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share Report
        </button>
      </div>

      {/* Main Item Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Left Column: Big Image Display */}
        <div className="lg:col-span-6 bg-slate-100 flex items-center justify-center relative min-h-[360px] max-h-[520px] overflow-hidden">
          <img
            src={
              item.image ||
              'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=1000&auto=format&fit=crop&q=80'
            }
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                isLost ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {item.type}
            </span>
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md">
              {item.category}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize shadow-lg backdrop-blur-md ${
                item.status === 'resolved'
                  ? 'bg-emerald-500 text-white'
                  : item.status === 'claimed'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              Status: {item.status}
            </span>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {item.title}
            </h1>

            {/* Location & Time Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="font-semibold truncate">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Reported on: <strong className="font-semibold text-slate-900">{item.date}</strong></span>
              </div>
              {item.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Time: {item.time}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Security Protected</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detailed Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Reporter Profile Box */}
            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-200 text-brand-800 flex items-center justify-center font-bold text-sm overflow-hidden">
                  {item.reportedBy?.profileImage ? (
                    <img
                      src={item.reportedBy.profileImage}
                      alt={item.reportedBy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    item.reportedBy?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reported By</p>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.reportedBy?.name || 'Campus Member'}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {item.reportedBy?.department} • {item.reportedBy?.year}
                  </p>
                </div>
              </div>

              {/* Show contact details if current user is owner or approved claimant */}
              {isOwner && item.reportedBy?.phone && (
                <div className="text-right text-xs text-slate-600">
                  <p className="font-semibold">{item.reportedBy.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {canManage ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Reporter Controls
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Resolved / Recovered
                    </button>
                  )}
                  {item.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusChange('active')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                    >
                      Reopen Report (Active)
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Report
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {isAuthenticated ? (
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    disabled={item.status === 'resolved'}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    {isLost ? 'I Have Found This Item' : 'Claim This Item (I am Owner)'}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Sign In to Claim or Contact Reporter
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claims Management Section (Visible for Owner / Admin) */}
      {canManage && claims.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Incoming Claims ({claims.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Review proof submitted by students
            </span>
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim._id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {claim.claimant?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {claim.claimant?.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {claim.claimant?.department} • {claim.claimant?.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold capitalize ${
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

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Verification Details:</p>
                  {claim.message}
                </div>

                {claim.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleClaimDecision(claim._id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                    >
                      <XCircle className="w-4 h-4" /> Reject Claim
                    </button>
                    <button
                      onClick={() => handleClaimDecision(claim._id, 'approved')}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Submission Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        item={item}
        onSuccess={fetchDetails}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to permanently delete this report and any associated claim history?"
        confirmText="Delete Report"
        isLoading={deleting}
      />
    </div>
  );
};

export default ItemDetails;
