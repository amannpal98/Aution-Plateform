import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { placeBid } from '../services/api';
import { useNotification } from './Notification';
import { Link } from 'react-router-dom';

const BidForm = ({ auction, onBidPlaced }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!auction) return null;

  const isEnded = auction.status !== 'active' || new Date(auction.endTime) <= new Date();
  const isOwner = user && auction.seller?._id === user._id;
  const minBid = auction.currentBid > 0
    ? auction.currentBid + (auction.minIncrement || 1)
    : auction.startingPrice;

  const handleBid = async (e) => {
    e.preventDefault();
    const bidAmount = parseFloat(amount);
    if (!bidAmount || bidAmount < minBid) {
      addToast(`Minimum bid is $${minBid.toFixed(2)}`, 'warning');
      return;
    }
    setLoading(true);
    try {
      await placeBid({ auctionId: auction._id, amount: bidAmount });
      addToast(`🔨 Bid of $${bidAmount.toFixed(2)} placed!`, 'bid');
      setAmount('');
      onBidPlaced?.();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place bid', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isEnded) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">⏰</div>
        <p className="text-slate-400 font-medium">This auction has ended</p>
        {auction.winner && (
          <p className="text-emerald-400 text-sm mt-2">
            🏆 Won by: <span className="font-bold">{auction.winner?.name}</span>
          </p>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card text-center py-8 space-y-4">
        <div className="text-4xl">🔐</div>
        <p className="text-slate-400">Sign in to place a bid</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="btn-primary">Login</Link>
          <Link to="/register" className="btn-secondary">Register</Link>
        </div>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="card text-center py-6">
        <p className="text-slate-400 text-sm">You cannot bid on your own auction.</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Place Your Bid</h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
          Min increment: ${auction.minIncrement || 1}
        </span>
      </div>

      {/* Current bid display */}
      <div className="bg-gradient-to-r from-blue-900/30 to-violet-900/30 border border-blue-700/30 rounded-xl p-4">
        <p className="text-xs text-slate-400 mb-1">
          {auction.currentBid > 0 ? 'Current Highest Bid' : 'Starting Price'}
        </p>
        <p className="text-3xl font-black text-white">
          <span className="text-amber-400">$</span>
          {(auction.currentBid > 0 ? auction.currentBid : auction.startingPrice).toLocaleString()}
        </p>
        {auction.highestBidder && (
          <p className="text-xs text-slate-500 mt-1">
            by <span className="text-slate-400">{auction.highestBidder?.name}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleBid} className="space-y-3">
        <div>
          <label className="label">Your Bid Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-lg">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={minBid.toFixed(2)}
              min={minBid}
              step="0.01"
              className="input pl-9 text-lg font-bold"
              required
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Minimum bid: <span className="text-amber-400 font-semibold">${minBid.toFixed(2)}</span></p>
        </div>

        {/* Quick bid buttons */}
        <div className="flex gap-2">
          {[minBid, minBid + 10, minBid + 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val.toFixed(2))}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
            >
              ${val.toFixed(0)}
            </button>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full text-base py-3">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              Placing Bid...
            </span>
          ) : '🔨 Place Bid'}
        </button>
      </form>
    </div>
  );
};

export default BidForm;
