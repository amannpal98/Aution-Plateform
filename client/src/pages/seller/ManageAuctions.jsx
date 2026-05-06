import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyAuctions, deleteAuction } from '../../services/api';
import { useNotification } from '../../components/Notification';
import CountdownTimer from '../../components/CountdownTimer';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=100&h=100&fit=crop';

const statusStyle = {
  active:    'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  ended:     'bg-slate-800      text-slate-400   border-slate-700',
  pending:   'bg-amber-900/60   text-amber-300   border-amber-700',
  cancelled: 'bg-red-900/60     text-red-300     border-red-700',
};

const ManageAuctions = () => {
  const { addToast } = useNotification();
  const [auctions, setAuctions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetch = () => {
    getMyAuctions()
      .then(({ data }) => setAuctions(data.auctions))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this auction? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteAuction(id);
      setAuctions((prev) => prev.filter((a) => a._id !== id));
      addToast('Auction deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(null);
    }
  };

  // Stats
  const active = auctions.filter((a) => a.status === 'active').length;
  const ended  = auctions.filter((a) => a.status === 'ended').length;
  const revenue = auctions
    .filter((a) => a.status === 'ended' && a.currentBid > 0)
    .reduce((s, a) => s + a.currentBid, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">My Auctions</h1>
          <p className="text-slate-400 mt-1">Manage your listings</p>
        </div>
        <Link to="/seller/create" className="btn-primary">+ New Auction</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active',   value: active,   color: 'text-emerald-400' },
          { label: 'Ended',    value: ended,     color: 'text-slate-400' },
          { label: 'Revenue',  value: `$${revenue.toLocaleString()}`, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-white mb-2">No auctions yet</h3>
          <p className="text-slate-400 mb-6">Create your first auction listing to start selling.</p>
          <Link to="/seller/create" className="btn-primary">Create Auction</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map((auction) => {
            const isLive = auction.status === 'active' && new Date(auction.endTime) > new Date();
            return (
              <div key={auction._id} className="card flex flex-col sm:flex-row gap-4">
                <img
                  src={auction.images?.[0] || PLACEHOLDER}
                  alt={auction.title}
                  className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link to={`/auctions/${auction._id}`}
                      className="font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
                      {auction.title}
                    </Link>
                    <span className={`badge flex-shrink-0 border ${statusStyle[auction.status] || statusStyle.ended}`}>
                      {auction.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm mb-3">
                    <span className="text-slate-500">
                      Current: <span className="text-amber-400 font-bold">
                        ${auction.currentBid > 0 ? auction.currentBid.toLocaleString() : auction.startingPrice.toLocaleString()}
                      </span>
                    </span>
                    <span className="text-slate-500">
                      Bids: <span className="text-white font-semibold">{auction.totalBids}</span>
                    </span>
                    <span className="text-slate-500">
                      Views: <span className="text-white font-semibold">{auction.views}</span>
                    </span>
                    {auction.winner && (
                      <span className="text-emerald-400 text-xs">
                        🏆 Won by: {auction.winner?.name}
                      </span>
                    )}
                  </div>

                  {isLive && (
                    <div className="mb-3">
                      <CountdownTimer endTime={auction.endTime} compact />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/auctions/${auction._id}`}
                      className="btn-secondary text-xs py-1.5 px-3">View</Link>
                    {auction.totalBids === 0 && auction.status === 'active' && (
                      <Link to={`/seller/edit/${auction._id}`}
                        className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                    )}
                    <button
                      onClick={() => handleDelete(auction._id)}
                      disabled={deleting === auction._id}
                      className="btn-danger text-xs py-1.5 px-3 disabled:opacity-50">
                      {deleting === auction._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageAuctions;
