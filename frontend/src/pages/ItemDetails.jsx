import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Shield,
  Send,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Share2,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in bg-[#FFFBE3]">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#121212] hover:text-[#334FB4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#334FB4]" />
          Back to Browse
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#121212] bg-white hover:bg-[#FFFBE3] text-xs font-bold text-[#121212] shadow-sm uppercase tracking-wider"
        >
          <Share2 className="w-3.5 h-3.5 text-[#334FB4]" />
          Share Report
        </button>
      </div>

      {/* Main Item Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border-2 border-[#121212] shadow-xl overflow-hidden">
        {/* Left Column: Big Image Display */}
        <div className="lg:col-span-6 bg-[#FFFBE3] flex items-center justify-center relative min-h-[360px] max-h-[520px] overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-[#121212]">
          <img
            src={
              item.image ||
              'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80'
            }
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md border border-[#121212] ${
                isLost ? 'bg-[#FFD1DC] text-[#121212]' : 'bg-[#53FF73] text-[#121212]'
              }`}
            >
              {item.type}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#121212] text-[#FFFBE3]">
              {item.category}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md border border-[#121212] ${
                item.status === 'resolved'
                  ? 'bg-[#53FF73] text-[#121212]'
                  : item.status === 'claimed'
                  ? 'bg-[#F1FF54] text-[#121212]'
                  : 'bg-[#EFE3FF] text-[#334FB4]'
              }`}
            >
              Status: {item.status}
            </span>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-4">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#121212] tracking-tight leading-tight">
              {item.title}
            </h1>

            {/* Location & Time Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#121212] bg-[#FFFBE3] p-4 rounded-2xl border border-[#121212]">
              <div className="flex items-center gap-2 font-semibold">
                <MapPin className="w-4 h-4 text-[#334FB4] shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#334FB4] shrink-0" />
                <span>Reported: <strong className="font-bold">{item.date}</strong></span>
              </div>
              {item.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#334FB4] shrink-0" />
                  <span>Time: {item.time}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#334FB4] shrink-0" />
                <span>Campus Verified</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#334FB4]">
                Detailed Description
              </h3>
              <p className="text-xs text-[#121212]/80 leading-relaxed whitespace-pre-line font-medium">
                {item.description}
              </p>
            </div>

            {/* Reporter Profile Box */}
            <div className="p-4 rounded-2xl bg-[#EFE3FF]/50 border border-[#121212]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#334FB4] text-white flex items-center justify-center font-bold text-xs">
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
                  <p className="text-[10px] uppercase font-bold text-[#334FB4]">Reported By</p>
                  <h4 className="text-xs font-bold text-[#121212]">
                    {item.reportedBy?.name || 'Campus Member'}
                  </h4>
                  <p className="text-[10px] text-[#121212]/60 font-medium">
                    {item.reportedBy?.department} • {item.reportedBy?.year}
                  </p>
                </div>
              </div>

              {isOwner && item.reportedBy?.phone && (
                <div className="text-right text-xs text-[#121212] font-bold">
                  <p>{item.reportedBy.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#E5E0D8] space-y-3">
            {canManage ? (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[#334FB4] uppercase tracking-widest">
                  Reporter Controls
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      className="px-4 py-2.5 rounded-full text-xs font-bold text-[#121212] bg-[#53FF73] border border-[#121212] shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Resolved / Recovered
                    </button>
                  )}
                  {item.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusChange('active')}
                      className="px-4 py-2.5 rounded-full text-xs font-bold text-[#121212] bg-[#FFFBE3] border border-[#121212] transition-all flex items-center gap-1.5"
                    >
                      Reopen Report (Active)
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300 transition-all flex items-center gap-1.5"
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
                    className="w-full py-4 px-6 rounded-full font-bold text-white bg-[#121212] hover:bg-[#334FB4] shadow-md transition-all flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-[#53FF73]" />
                    {isLost ? 'I Have Found This Item' : 'Claim This Item (I am Owner)'}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-4 px-6 rounded-full font-bold text-white bg-[#121212] hover:bg-[#334FB4] shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    Sign In to Claim or Contact Reporter
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claims Management Section */}
      {canManage && claims.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-[#121212] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-[#334FB4]" />
              <h2 className="font-display text-lg font-bold text-[#121212]">
                Incoming Claims ({claims.length})
              </h2>
            </div>
            <span className="text-xs text-[#121212]/60 font-medium">
              Review proof submitted by students
            </span>
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim._id}
                className="p-5 rounded-2xl border border-[#121212] bg-[#FFFBE3] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#334FB4] text-white flex items-center justify-center font-bold text-xs">
                      {claim.claimant?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#121212]">
                        {claim.claimant?.name}
                      </h4>
                      <p className="text-[10px] text-[#121212]/60">
                        {claim.claimant?.department} • {claim.claimant?.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#121212] ${
                      claim.status === 'approved'
                        ? 'bg-[#53FF73] text-[#121212]'
                        : claim.status === 'rejected'
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-[#F1FF54] text-[#121212]'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#121212]/20 text-xs text-[#121212] leading-relaxed font-medium">
                  <p className="font-bold text-[#334FB4] mb-1 text-[10px] uppercase">Verification Details:</p>
                  {claim.message}
                </div>

                {claim.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleClaimDecision(claim._id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleClaimDecision(claim._id, 'approved')}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold text-[#121212] bg-[#53FF73] border border-[#121212] shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
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

