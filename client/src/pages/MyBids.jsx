import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserBids } from '../services/api';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=100&h=100&fit=crop';

const MyBids = () => {
  const [bids, setBids]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserBids()
      .then(({ data }) => setBids(data.bids))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group bids by auction
  const grouped = bids.reduce((acc, bid) => {
    const id = bid.auction?._id;
    if (!id) return acc;
    if (!acc[id]) acc[id] = { auction: bid.auction, bids: [] };
    acc[id].bids.push(bid);
    return acc;
  }, {});

  const entries = Object.values(grouped);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">My Bids 🔨</h1>
        <p className="text-slate-400 mt-1">Track all your bidding activity</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-28" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔨</div>
          <h3 className="text-xl font-bold text-white mb-2">No bids yet</h3>
          <p className="text-slate-400 mb-6">Start bidding on auctions to see your history here.</p>
          <Link to="/auctions" className="btn-primary">Browse Auctions</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(({ auction, bids: auctionBids }) => {
            const isActive = auction?.status === 'active' && new Date(auction?.endTime) > new Date();
            const myHighest = Math.max(...auctionBids.map((b) => b.amount));
            const isWinning = auction?.highestBidder === auction?.highestBidder && myHighest === auction?.currentBid;

            return (
              <Link key={auction?._id} to={`/auctions/${auction?._id}`}
                className="card flex gap-4 hover:border-blue-500/50 transition-all group block">
                <img
                  src={auction?.images?.[0] || PLACEHOLDER}
                  alt={auction?.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {auction?.title}
                    </h3>
                    <span className={`badge flex-shrink-0 border ${
                      isActive ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                               : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isActive ? '🟢 Live' : '⏹ Ended'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-slate-500">My highest bid: </span>
                      <span className="text-amber-400 font-bold">${myHighest.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Current bid: </span>
                      <span className="font-semibold text-white">${auction?.currentBid?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Total bids placed: </span>
                      <span className="font-semibold text-slate-300">{auctionBids.length}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent bid list */}
      {bids.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">All Bid Activity</h2>
          <div className="card overflow-hidden !p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Auction</th>
                  <th className="text-right text-slate-400 font-medium px-4 py-3">Amount</th>
                  <th className="text-right text-slate-400 font-medium px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/auctions/${bid.auction?._id}`}
                        className="text-slate-300 hover:text-blue-400 font-medium transition-colors line-clamp-1">
                        {bid.auction?.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-400">${bid.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBids;
