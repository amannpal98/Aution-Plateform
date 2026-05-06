import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuctions } from '../services/api';
import AuctionCard from '../components/AuctionCard';

const CATEGORIES = ['All', 'Electronics', 'Art', 'Jewelry', 'Vehicles', 'Fashion', 'Collectibles', 'Real Estate', 'Sports', 'Other'];
const SORTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'ending',     label: 'Ending Soon' },
  { value: 'price-low',  label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'popular',    label: 'Most Popular' },
];

const Auctions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]     = useState(true);

  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const search   = searchParams.get('search')   || '';
  const status   = searchParams.get('status')   || 'active';
  const page     = Number(searchParams.get('page') || 1);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (category && category !== 'All') params.category = category;
      if (search)  params.search = search;
      if (status)  params.status = status;
      const { data } = await getAuctions(params);
      setAuctions(data.auctions);
      setPagination(data.pagination);
    } catch (_) {}
    setLoading(false);
  }, [category, sort, search, status, page]);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  const set = (key, val) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, val);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const [searchInput, setSearchInput] = useState(search);

  const handleSearch = (e) => {
    e.preventDefault();
    set('search', searchInput);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">All Auctions</h1>
        <p className="text-slate-400 mt-1">{pagination.total || 0} items found</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search auctions..."
            className="input flex-1"
          />
          <button type="submit" className="btn-primary px-6">Search</button>
        </form>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => set('sort', e.target.value)}
          className="input w-auto min-w-[180px] cursor-pointer"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => set('status', e.target.value)}
          className="input w-auto min-w-[140px] cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => set('category', cat === 'All' ? '' : cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              (cat === 'All' && !category) || cat === category
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
                <div className="h-8 bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No auctions found</h3>
          <p className="text-slate-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((a) => <AuctionCard key={a._id} auction={a} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => set('page', page - 1)}
            disabled={page <= 1}
            className="btn-secondary px-4 py-2 disabled:opacity-40"
          >← Prev</button>

          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => set('page', i + 1)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >{i + 1}</button>
          ))}

          <button
            onClick={() => set('page', page + 1)}
            disabled={page >= pagination.pages}
            className="btn-secondary px-4 py-2 disabled:opacity-40"
          >Next →</button>
        </div>
      )}
    </div>
  );
};

export default Auctions;
