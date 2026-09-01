import React, { useState, useEffect, useCallback } from 'react';
import { getAdminUsers, deleteAdminUser } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Users,
  Search,
  Trash2,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion modal
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers({
        page,
        limit: 15,
        role: role !== 'all' ? role : undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      const res = await deleteAdminUser(userToDelete._id);
      if (res.success) {
        success('User and associated data removed');
        setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus User Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage registered students, staff, and campus security administrative accounts.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto">
          {totalCount} Registered Users
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, email, department..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Roles (Students & Admins)</option>
            <option value="student">Students Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading campus user directory..." />
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Department & Year</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  const isSelf = currentUser?._id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {u.profileImage ? (
                              <img
                                src={u.profileImage}
                                alt={u.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              u.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{u.department || 'General'}</p>
                        <p className="text-[10px] text-slate-400">{u.year || 'Student'}</p>
                      </td>

                      <td className="p-4 text-slate-600">{u.phone || '—'}</td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-brand-50 text-brand-700 border border-brand-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isSelf && (
                          <span className="text-[10px] font-semibold text-slate-400 italic">
                            (Current Admin)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No users found"
            description="No user accounts match your search criteria."
          />
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to remove "${userToDelete?.name}"? This will permanently delete their account and all reported lost/found items.`}
        confirmText="Delete Account"
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminUsers;
