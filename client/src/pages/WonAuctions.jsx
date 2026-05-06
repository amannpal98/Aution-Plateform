import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWonAuctions } from '../services/api';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=100&h=100&fit=crop';

const WonAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getWonAuctions()
      .then(({ data }) => setAuctions(data.auctions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Won Auctions 🏆</h1>
        <p className="text-slate-400 mt-1">Items you've successfully won</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-40" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-white mb-2">No wins yet</h3>
          <p className="text-slate-400 mb-6">Keep bidding — your first win is just around the corner!</p>
          <Link to="/auctions" className="btn-primary">Browse Auctions</Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-black text-amber-400">{auctions.length}</div>
              <div className="text-slate-400 text-sm mt-1">Items Won</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-black text-white">
                ${auctions.reduce((s, a) => s + (a.currentBid || 0), 0).toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm mt-1">Total Spent</div>
            </div>
            <div className="card text-center col-span-2 sm:col-span-1">
              <div className="text-3xl">🎉</div>
              <div className="text-slate-400 text-sm mt-1">Congratulations!</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {auctions.map((auction) => (
              <Link key={auction._id} to={`/auctions/${auction._id}`}
                className="card flex gap-4 hover:border-amber-500/50 transition-all group">
                <div className="relative flex-shrink-0">
                  <img
                    src={auction.images?.[0] || PLACEHOLDER}
                    alt={auction.title}
                    className="w-24 h-24 rounded-xl object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-sm">
                    🏆
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 text-sm">
                    {auction.title}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Winning Bid</span>
                      <span className="font-black text-amber-400">${auction.currentBid?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Category</span>
                      <span className="text-xs text-slate-400">{auction.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Sold by</span>
                      <span className="text-xs text-slate-400">{auction.seller?.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WonAuctions;
