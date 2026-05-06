import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAuctions, deleteAuction, featureAuction } from '../../services/api';
import { useNotification } from '../../components/Notification';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=80&h=80&fit=crop';

const statusStyle = {
  active:    'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  ended:     'bg-slate-800      text-slate-400   border-slate-700',
  pending:   'bg-amber-900/60   text-amber-300   border-amber-700',
  cancelled: 'bg-red-900/60     text-red-300     border-red-700',
};

const AuctionManagement = () => {
  const { addToast } = useNotification();
  const [auctions, setAuctions] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminAuctions({ status: statusFilter });
      setAuctions(data.auctions);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete auction "${title}"?`)) return;
    try {
      await deleteAuction(id);
      setAuctions((prev) => prev.filter((a) => a._id !== id));
      addToast('Auction deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleFeature = async (id) => {
    try {
      const { data } = await featureAuction(id);
      setAuctions((prev) => prev.map((a) => a._id === id ? { ...a, featured: data.auction.featured } : a));
      addToast(data.auction.featured ? '⭐ Auction featured' : 'Feature removed', 'success');
    } catch (err) {
      addToast('Failed to update', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Auction Management 🏷️</h1>
          <p className="text-slate-400 mt-1">{total} total auctions</p>
        </div>
        <Link to="/seller/create" className="btn-primary text-sm">+ Create Auction</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['', 'active', 'ended', 'pending', 'cancelled'].map((s) => (
          <button key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              statusFilter === s
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No auctions found</div>
      ) : (
        <div className="space-y-3">
          {auctions.map((a) => (
            <div key={a._id} className="card flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <img
                src={a.images?.[0] || PLACEHOLDER}
                alt={a.title}
                className="w-full sm:w-16 h-32 sm:h-16 rounded-xl object-cover flex-shrink-0"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Link to={`/auctions/${a._id}`}
                    className="font-bold text-white hover:text-blue-400 transition-colors line-clamp-1 text-sm">
                    {a.title}
                  </Link>
                  {a.featured && <span className="badge bg-amber-500/20 text-amber-300 border border-amber-600 text-xs">⭐ Featured</span>}
                  <span className={`badge border text-xs ${statusStyle[a.status] || statusStyle.ended}`}>{a.status}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Seller: <span className="text-slate-400">{a.seller?.name}</span></span>
                  <span>Bids: <span className="text-white">{a.totalBids}</span></span>
                  <span>Price: <span className="text-amber-400 font-bold">${(a.currentBid || a.startingPrice).toLocaleString()}</span></span>
                  <span>Ends: {new Date(a.endTime).toLocaleDateString()}</span>
                  {a.winner && <span className="text-emerald-400">🏆 {a.winner?.name}</span>}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleFeature(a._id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    a.featured
                      ? 'bg-amber-900/30 text-amber-400 border-amber-700 hover:bg-amber-900/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-amber-600 hover:text-amber-400'
                  }`}>
                  {a.featured ? '★ Unfeature' : '☆ Feature'}
                </button>
                <Link to={`/auctions/${a._id}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors">
                  View
                </Link>
                <button
                  onClick={() => handleDelete(a._id, a.title)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-900/30 text-red-400 border border-red-700 hover:bg-red-900/50 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionManagement;
