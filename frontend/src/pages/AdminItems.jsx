import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminItems,
  updateAdminItemStatus,
  deleteAdminItem,
} from '../services/adminService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Search,
  Package,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'ID Card',
  'Wallet',
  'Keys',
  'Books',
  'Clothing',
  'Accessories',
  'Documents',
  'Other',
];

const AdminItems = () => {
  const { success, error } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion modal
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminItems({
        page,
        limit: 15,
        type: type !== 'all' ? type : undefined,
        category: category !== 'All' ? category : undefined,
        status: status !== 'all' ? status : undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setItems(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      error('Failed to load items for moderation');
    } finally {
      setLoading(false);
    }
  }, [page, type, category, status, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await updateAdminItemStatus(itemId, newStatus);
      if (res.success) {
        success(`Item status updated to ${newStatus}`);
        setItems((prev) =>
          prev.map((i) => (i._id === itemId ? { ...i, status: newStatus } : i))
        );
      }
    } catch (err) {
      error('Failed to change status');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      const res = await deleteAdminItem(itemToDelete._id);
      if (res.success) {
        success('Item deleted by administrator');
        setItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
      }
    } catch (err) {
      error('Failed to delete item');
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Moderate Campus Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, edit status, or remove reported lost & found items across the entire university.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto">
          {totalCount} Total Items
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search title, location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">All Types (Lost & Found)</option>
            <option value="lost">Lost Only</option>
            <option value="found">Found Only</option>
          </select>
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Moderation Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching campus items..." />
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Item & Preview</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location & Date</th>
                  <th className="p-4">Reported By</th>
                  <th className="p-4">Status Action</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=120'
                          }
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 max-w-[200px]">
                          <p className="font-bold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
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

                    <td className="p-4 font-medium text-slate-600">{item.category}</td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800 truncate max-w-[140px]">
                        {item.location}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.date}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800 truncate max-w-[130px]">
                        {item.reportedBy?.name || 'Unknown'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {item.reportedBy?.email}
                      </p>
                    </td>

                    <td className="p-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border outline-none ${
                          item.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'claimed'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="claimed">Claimed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/item/${item._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Open View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Force Delete"
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
            icon={Package}
            title="No items found"
            description="No items match your moderation query."
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Force Delete Item"
        message={`Are you sure you want to permanently delete "${itemToDelete?.title}" and all its claim records from the system?`}
        confirmText="Confirm Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminItems;
