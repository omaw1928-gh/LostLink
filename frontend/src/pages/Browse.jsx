import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RotateCcw,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#FFFBE3]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#121212]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight">
            Campus Lost & Found Feed
          </h1>
          <p className="text-xs sm:text-sm text-[#121212]/70 font-medium mt-1">
            Browse through items lost and found across university campus buildings.
          </p>
        </div>

        {/* Total stats pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-4 py-1.5 rounded-full bg-[#EFE3FF] border border-[#334FB4] text-[#334FB4] text-xs font-bold uppercase tracking-wider">
            {totalCount} Items Reported
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-[#121212] shadow-sm space-y-4">
        {/* Top search & Type tabs */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Type Segment Control */}
          <div className="flex p-1 bg-[#FFFBE3] rounded-full w-full lg:w-auto shrink-0 border border-[#121212]">
            <button
              onClick={() => {
                setType('all');
                setPage(1);
              }}
              className={`flex-1 lg:flex-none px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                type === 'all'
                  ? 'bg-[#121212] text-[#FFFBE3] shadow-sm'
                  : 'text-[#121212] hover:bg-white'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => {
                setType('lost');
                setPage(1);
              }}
              className={`flex-1 lg:flex-none px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                type === 'lost'
                  ? 'bg-[#FFD1DC] text-[#121212] border border-[#121212]'
                  : 'text-[#121212] hover:bg-white'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => {
                setType('found');
                setPage(1);
              }}
              className={`flex-1 lg:flex-none px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                type === 'found'
                  ? 'bg-[#53FF73] text-[#121212] border border-[#121212]'
                  : 'text-[#121212] hover:bg-white'
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#334FB4] absolute left-4 top-3" />
            <input
              type="text"
              placeholder="Search by keywords, title, color, or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-[#FFFBE3] rounded-full border border-[#121212] focus:bg-white focus:ring-2 focus:ring-[#334FB4] outline-none text-xs text-[#121212] font-semibold"
            />
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#E5E0D8]">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334FB4] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#FFFBE3] border border-[#121212] rounded-full text-xs font-semibold text-[#121212] outline-none"
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334FB4] mb-1">
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
                className="w-full pl-8 pr-3 py-2 bg-[#FFFBE3] border border-[#121212] rounded-full text-xs font-semibold text-[#121212] outline-none"
              />
              <MapPin className="w-3.5 h-3.5 text-[#334FB4] absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334FB4] mb-1">
              Item Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#FFFBE3] border border-[#121212] rounded-full text-xs font-semibold text-[#121212] outline-none"
            >
              <option value="active">Active Only (Unresolved)</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved / Recovered</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334FB4] mb-1">
              Sort Order
            </label>
            <div className="flex gap-1.5">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
                className="flex-1 px-3 py-2 bg-[#FFFBE3] border border-[#121212] rounded-full text-xs font-semibold text-[#121212] outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 bg-[#121212] hover:bg-[#334FB4] text-[#FFFBE3] rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
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
                className="p-2.5 rounded-full border border-[#121212] bg-white hover:bg-[#FFFBE3] disabled:opacity-40 disabled:cursor-not-allowed text-[#121212]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-[#121212] px-4 py-2 rounded-full bg-white border border-[#121212]">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2.5 rounded-full border border-[#121212] bg-white hover:bg-[#FFFBE3] disabled:opacity-40 disabled:cursor-not-allowed text-[#121212]"
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

