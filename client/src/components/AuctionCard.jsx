import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=400&h=300&fit=crop';

const statusBadge = {
  active:    'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  ended:     'bg-slate-800      text-slate-400   border-slate-700',
  pending:   'bg-amber-900/60   text-amber-300   border-amber-700',
  cancelled: 'bg-red-900/60     text-red-300     border-red-700',
};

const AuctionCard = ({ auction }) => {
  const {
    _id, title, images, category, currentBid, startingPrice,
    endTime, status, totalBids, seller, featured,
  } = auction;

  const img = images?.[0] || PLACEHOLDER;
  const price = currentBid > 0 ? currentBid : startingPrice;
  const isActive = status === 'active' && new Date(endTime) > new Date();

  return (
    <Link to={`/auctions/${_id}`} className="group block">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden
                      hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10
                      transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative overflow-hidden h-48">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {featured && (
              <span className="badge bg-amber-500/90 text-slate-900 font-bold border border-amber-400">⭐ Featured</span>
            )}
            <span className={`badge border ${statusBadge[status] || statusBadge.active}`}>
              {status === 'active' ? '🟢 Live' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Category */}
          <div className="absolute top-3 right-3">
            <span className="badge bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-sm">{category}</span>
          </div>

          {/* Timer */}
          {isActive && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700">
                <CountdownTimer endTime={endTime} compact />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-white text-base leading-tight line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">{currentBid > 0 ? 'Current Bid' : 'Starting Bid'}</p>
              <p className="text-2xl font-black text-white">
                <span className="text-amber-400">$</span>{price.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Bids</p>
              <p className="text-lg font-bold text-slate-300">{totalBids}</p>
            </div>
          </div>

          {seller && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                {seller.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-slate-500">by <span className="text-slate-400">{seller.name}</span></p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
