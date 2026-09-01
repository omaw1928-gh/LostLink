import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  MapPin,
  ChevronLeft,
  ChevronRight,
  PackageSearch
} from 'lucide-react';
import { getItems } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

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

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'active');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state to URL search params
  const updateUrlParams = useCallback(() => {
    const params = {};
    if (type !== 'all') params.type = type;
    if (category !== 'All') params.category = category;
    if (location) params.location = location;
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    if (sortBy !== 'createdAt') params.sortBy = sortBy;
    if (sortOrder !== 'desc') params.sortOrder = sortOrder;
    if (page > 1) params.page = page.toString();

    setSearchParams(params);
  }, [type, category, location, status, search, sortBy, sortOrder, page, setSearchParams]);

  // Fetch Items from API
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const query = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };

      if (type !== 'all') query.type = type;
      if (category !== 'All') query.category = category;
      if (location.trim()) query.location = location.trim();
      if (status !== 'all') query.status = status;
      if (search.trim()) query.search = search.trim();

      const res = await getItems(query);
      if (res.success) {
        setItems(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  }, [type, category, location, status, search, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchItems();
    updateUrlParams();
  }, [fetchItems, updateUrlParams]);

  const handleResetFilters = () => {
    setType('all');
    setCategory('All');
    setLocation('');
    setStatus('active');
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Lost & Found Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse through items lost and found across university campus buildings.
          </p>
        </div>

        {/* Total stats pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3.5 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            {totalCount} Items Reported
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Top search & Type tabs */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Type Segment Control */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-full lg:w-auto shrink-0 border border-slate-200/80">
            <button
              onClick={() => {
                setType('all');
                setPage(1);
              }}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => {
                setType('lost');
                setPage(1);
              }}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'lost'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => {
                setType('found');
                setPage(1);
              }}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by keywords, title, color, or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-xs sm:text-sm text-slate-800"
            />
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Category Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Location Filter
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Library, Science Hall..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Item Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="active">Active Only (Unresolved)</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved / Recovered</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort Order
            </label>
            <div className="flex gap-1.5">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <LoadingSpinner text="Searching campus database..." />
      ) : items.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-600 px-4 py-2 rounded-xl bg-white border border-slate-200">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No items found"
          description="We couldn't find any reports matching your active filters. Try searching different keywords or resetting filters."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};

export default Browse;
