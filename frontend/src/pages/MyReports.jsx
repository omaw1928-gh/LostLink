import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getItems, deleteItem, updateItemStatus } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Layers,
  PlusCircle,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
  Tag,
  MapPin
} from 'lucide-react';

const MyReports = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await getItems({ reportedBy: user?._id, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      error('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchMyReports();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      const res = await deleteItem(itemToDelete._id);
      if (res.success) {
        success('Item report deleted successfully');
        setItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleStatusToggle = async (item) => {
    const nextStatus = item.status === 'resolved' ? 'active' : 'resolved';
    try {
      const res = await updateItemStatus(item._id, nextStatus);
      if (res.success) {
        success(`Item marked as ${nextStatus}`);
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, status: nextStatus } : i))
        );
      }
    } catch (err) {
      error('Failed to update status');
    }
  };

  const filteredItems = items.filter((i) => {
    if (filterType === 'lost') return i.type === 'lost';
    if (filterType === 'found') return i.type === 'found';
    if (filterType === 'resolved') return i.status === 'resolved' || i.status === 'claimed';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Reported Belongings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your lost and found listings, update statuses, or remove resolved cases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/report-lost"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
          >
            + Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
          >
            + Report Found
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: `All Reports (${items.length})` },
          { key: 'lost', label: `Lost (${items.filter((i) => i.type === 'lost').length})` },
          { key: 'found', label: `Found (${items.filter((i) => i.type === 'found').length})` },
          {
            key: 'resolved',
            label: `Resolved (${
              items.filter((i) => i.status === 'resolved' || i.status === 'claimed').length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching your reports..." />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isLost = item.type === 'lost';
            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Image & Type Badge */}
                  <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white ${
                        isLost ? 'bg-rose-500' : 'bg-emerald-600'
                      }`}
                    >
                      {item.type}
                    </span>

                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize ${
                        item.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'claimed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{item.location}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleStatusToggle(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      item.status === 'resolved'
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {item.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/item/${item._id}`}
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No reports in this category"
          description="You haven't filed any reports in this section yet."
          actionText="Create New Report"
          actionLink="/report-lost"
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Item Report"
        message={`Are you sure you want to permanently delete "${itemToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Report"
        isLoading={deleting}
      />
    </div>
  );
};

export default MyReports;
