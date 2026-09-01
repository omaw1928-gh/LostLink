import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminClaims } from '../services/adminService';
import { updateClaimStatus, deleteClaim } from '../services/claimService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

const AdminClaims = () => {
  const { success, error } = useToast();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion modal
  const [claimToDelete, setClaimToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminClaims({
        page,
        limit: 15,
        status: status !== 'all' ? status : undefined,
      });

      if (res.success) {
        setClaims(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleDecision = async (claimId, newStatus) => {
    try {
      const res = await updateClaimStatus(claimId, newStatus);
      if (res.success) {
        success(`Claim ${newStatus} by admin`);
        fetchClaims();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update claim');
    }
  };

  const handleDelete = async () => {
    if (!claimToDelete) return;
    try {
      setDeleting(true);
      const res = await deleteClaim(claimToDelete._id);
      if (res.success) {
        success('Claim record deleted');
        setClaims((prev) => prev.filter((c) => c._id !== claimToDelete._id));
      }
    } catch (err) {
      error('Failed to delete claim');
    } finally {
      setDeleting(false);
      setClaimToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Claims Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Oversee and resolve disputes for student ownership claims.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto">
          {totalCount} Total Claims
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Filter by Status:
        </label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Claims</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved Claims</option>
          <option value="rejected">Rejected Claims</option>
        </select>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading campus claims..." />
        ) : claims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Claimed Item</th>
                  <th className="p-4">Claimant Student</th>
                  <th className="p-4">Reported By</th>
                  <th className="p-4">Verification Message</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      {claim.item ? (
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/item/${claim.item._id}`}
                            className="font-bold text-slate-900 hover:text-brand-600 truncate max-w-[150px]"
                          >
                            {claim.item.title}
                          </Link>
                          <span
                            className={`px-1.5 py-0.5 rounded uppercase text-[9px] font-bold ${
                              claim.item.type === 'lost'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {claim.item.type}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Deleted Item</span>
                      )}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{claim.claimant?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400">{claim.claimant?.email}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800">
                        {claim.item?.reportedBy?.name || 'Unknown'}
                      </p>
                      <p className="text-[10px] text-slate-400">{claim.item?.reportedBy?.email}</p>
                    </td>

                    <td className="p-4 max-w-[220px]">
                      <p className="line-clamp-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                        {claim.message}
                      </p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          claim.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {claim.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleDecision(claim._id, 'approved')}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                              title="Force Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecision(claim._id, 'rejected')}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold"
                              title="Force Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setClaimToDelete(claim)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Claim"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileCheck}
            title="No claims found"
            description="There are currently no claims matching this filter."
          />
        )}
      </div>

      {/* Delete Claim Confirmation Modal */}
      <ConfirmModal
        isOpen={!!claimToDelete}
        onClose={() => setClaimToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Claim Record"
        message="Are you sure you want to permanently delete this claim record from the system?"
        confirmText="Confirm Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminClaims;
