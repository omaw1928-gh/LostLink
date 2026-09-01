import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMyClaims, updateClaimStatus, deleteClaim } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Shield,
  Trash2,
  User,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';

const MyClaims = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'submitted'
  const [claimsData, setClaimsData] = useState({ submitted: [], received: [] });
  const [loading, setLoading] = useState(true);

  // Claim to delete
  const [claimToDelete, setClaimToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await getMyClaims();
      if (res.success) {
        setClaimsData(res.data);
      }
    } catch (err) {
      error('Failed to load your claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchClaims();
    }
  }, [user]);

  const handleDecision = async (claimId, status) => {
    try {
      const res = await updateClaimStatus(claimId, status);
      if (res.success) {
        success(`Claim ${status} successfully!`);
        fetchClaims();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update claim');
    }
  };

  const handleDeleteClaim = async () => {
    if (!claimToDelete) return;
    try {
      setDeleting(true);
      const res = await deleteClaim(claimToDelete._id);
      if (res.success) {
        success('Claim request cancelled and removed');
        fetchClaims();
      }
    } catch (err) {
      error('Failed to cancel claim');
    } finally {
      setDeleting(false);
      setClaimToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Claims & Ownership Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review claims submitted for your belongings or track claims you submitted to others.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'received'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Claims on My Items
          <span className="px-2 py-0.5 rounded-full text-xs bg-brand-100 text-brand-800 font-bold">
            {claimsData.received.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submitted')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'submitted'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Claims I Submitted
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
            {claimsData.submitted.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Fetching claims..." />
      ) : activeTab === 'received' ? (
        /* Received Claims List */
        claimsData.received.length > 0 ? (
          <div className="space-y-4">
            {claimsData.received.map((claim) => (
              <div
                key={claim._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-brand-200 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                      {claim.claimant?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {claim.claimant?.name} <span className="font-normal text-slate-500">claimed</span> "{claim.item?.title}"
                      </h3>
                      <p className="text-xs text-slate-500">
                        {claim.claimant?.department} • {claim.claimant?.year} • {claim.claimant?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        claim.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                    {claim.item && (
                      <Link
                        to={`/item/${claim.item._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="View Original Item"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Message / Proof Block */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    Claim Verification Message:
                  </p>
                  <p className="leading-relaxed whitespace-pre-line">{claim.message}</p>
                </div>

                {/* Approved State Details: Show student phone if available */}
                {claim.status === 'approved' && claim.claimant?.phone && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Claimant Contact Phone: <strong>{claim.claimant.phone}</strong> (Reach out to coordinate hand-off)</span>
                  </div>
                )}

                {/* Action Buttons for Pending */}
                {claim.status === 'pending' && (
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDecision(claim._id, 'rejected')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Claim
                    </button>
                    <button
                      onClick={() => handleDecision(claim._id, 'approved')}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Verify Owner
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No incoming claims"
            description="When other students submit claims for items you've reported, they will show up here for your verification."
          />
        )
      ) : (
        /* Submitted Claims List */
        claimsData.submitted.length > 0 ? (
          <div className="space-y-4">
            {claimsData.submitted.map((claim) => (
              <div
                key={claim._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-brand-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                      Target Item
                    </span>
                    <h3 className="font-bold text-base text-slate-900">
                      {claim.item?.title || 'Reported Belonging'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Reported by {claim.item?.reportedBy?.name || 'Campus Member'} ({claim.item?.location})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        claim.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                    {claim.item && (
                      <Link
                        to={`/item/${claim.item._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="View Original Item"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    Your Submitted Verification Message:
                  </p>
                  <p className="leading-relaxed whitespace-pre-line">{claim.message}</p>
                </div>

                {claim.status === 'approved' && claim.item?.reportedBy && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4" /> Your claim was approved by the reporter!
                    </p>
                    <p>
                      Contact: <strong>{claim.item.reportedBy.name}</strong> •{' '}
                      <strong>{claim.item.reportedBy.email}</strong>{' '}
                      {claim.item.reportedBy.phone && `• ${claim.item.reportedBy.phone}`}
                    </p>
                  </div>
                )}

                {claim.status === 'pending' && (
                  <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setClaimToDelete(claim)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancel Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Send}
            title="No claims submitted yet"
            description="If you see your lost belonging listed in the found marketplace, you can submit a claim with verification proof."
            actionText="Browse Found Items"
            actionLink="/browse?type=found"
          />
        )
      )}

      {/* Delete / Cancel Claim Modal */}
      <ConfirmModal
        isOpen={!!claimToDelete}
        onClose={() => setClaimToDelete(null)}
        onConfirm={handleDeleteClaim}
        title="Cancel Claim"
        message="Are you sure you want to withdraw this claim request?"
        confirmText="Withdraw Claim"
        isLoading={deleting}
      />
    </div>
  );
};

export default MyClaims;
