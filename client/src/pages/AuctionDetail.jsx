import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuction, getAuctionBids } from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import BidForm from '../components/BidForm';
import { useNotification } from '../components/Notification';
import { useAuth } from '../context/AuthContext';
import socket from '../socket/socket';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&h=600&fit=crop';

const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [auction,   setAuction]   = useState(null);
  const [bids,      setBids]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [liveHighlight, setLiveHighlight] = useState(false);
  const highlightTimer = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [{ data: ad }, { data: bd }] = await Promise.all([
        getAuction(id),
        getAuctionBids(id),
      ]);
      setAuction(ad.auction);
      setBids(bd.bids);
    } catch {
      navigate('/auctions');
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.IO real-time bidding
  useEffect(() => {
    if (!id) return;
    socket.connect();
    socket.emit('join_auction', id);

    socket.on('new_bid', ({ currentBid, highestBidder, bid }) => {
      setAuction((prev) => prev ? { ...prev, currentBid, highestBidder, totalBids: (prev.totalBids || 0) + 1 } : prev);
      setBids((prev) => [bid, ...prev]);

      // Highlight animation
      setLiveHighlight(true);
      clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setLiveHighlight(false), 2000);

      if (user && highestBidder?._id !== user._id) {
        addToast(`🔨 New bid: $${currentBid.toFixed(2)} by ${highestBidder?.name}`, 'bid');
      }
    });

    socket.on('auction_ended', ({ winner, finalBid }) => {
      setAuction((prev) => prev ? { ...prev, status: 'ended', winner } : prev);
      addToast(`⏰ Auction ended! Final bid: $${finalBid}`, winner?._id === user?._id ? 'success' : 'info');
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.off('new_bid');
      socket.off('auction_ended');
      socket.disconnect();
    };
  }, [id, user, addToast]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!auction) return null;

  const imgs = auction.images?.length ? auction.images : [PLACEHOLDER];
  const isActive = auction.status === 'active' && new Date(auction.endTime) > new Date();
  const minBid = auction.currentBid > 0
    ? auction.currentBid + (auction.minIncrement || 1)
    : auction.startingPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Images + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="card !p-0 overflow-hidden">
            <img
              src={imgs[activeImg]}
              alt={auction.title}
              className="w-full h-80 sm:h-96 object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
            {imgs.length > 1 && (
              <div className="flex gap-2 p-4">
                {imgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-blue-500' : 'border-slate-700'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auction Info */}
          <div className="card space-y-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{auction.title}</h1>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge border ${isActive ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {isActive ? '🟢 Live' : '⏹ Ended'}
                </span>
                {auction.featured && <span className="badge bg-amber-500/90 text-slate-900 font-bold border border-amber-400">⭐ Featured</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="badge bg-blue-900/40 text-blue-300 border border-blue-700/50">{auction.category}</span>
              <span className="text-slate-500 text-sm">👁 {auction.views} views</span>
              <span className="text-slate-500 text-sm">🔨 {auction.totalBids} bids</span>
            </div>

            <div className="border-t border-slate-800 pt-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Description</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{auction.description}</p>
            </div>

            <div className="border-t border-slate-800 pt-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                {auction.seller?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500">Listed by</p>
                <p className="font-semibold text-white">{auction.seller?.name}</p>
              </div>
            </div>
          </div>

          {/* Bid History */}
          <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white">Bid History ({bids.length})</h3>
            {bids.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No bids yet. Be the first!</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {bids.map((bid, i) => (
                  <div key={bid._id || i} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${i === 0 ? 'bg-blue-900/20 border-blue-700/40' : 'bg-slate-800/50 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {bid.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{bid.user?.name}</p>
                        <p className="text-xs text-slate-500">{new Date(bid.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white">${bid.amount?.toLocaleString()}</p>
                      {i === 0 && <span className="text-xs text-emerald-400">Highest</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Bid Panel */}
        <div className="space-y-4">
          {/* Live price */}
          <div className={`card transition-all duration-500 ${liveHighlight ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950' : ''}`}>
            <p className="text-xs text-slate-400 mb-1">
              {auction.currentBid > 0 ? '💰 Current Highest Bid' : '💰 Starting Price'}
            </p>
            <p className="text-5xl font-black text-white leading-none">
              <span className="text-amber-400">$</span>
              {(auction.currentBid > 0 ? auction.currentBid : auction.startingPrice).toLocaleString()}
            </p>
            {auction.highestBidder && (
              <p className="text-sm text-slate-500 mt-2">
                by <span className="text-slate-300 font-semibold">{auction.highestBidder?.name}</span>
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2">⏰ Auction ends in</p>
              {isActive ? (
                <CountdownTimer endTime={auction.endTime} onEnd={() => setAuction((a) => a ? { ...a, status: 'ended' } : a)} />
              ) : (
                <p className="text-red-400 font-bold">Auction Ended</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Starting</p>
                <p className="font-bold text-slate-300">${auction.startingPrice?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Min Increment</p>
                <p className="font-bold text-slate-300">${auction.minIncrement || 1}</p>
              </div>
            </div>
          </div>

          {/* Winner banner */}
          {auction.status === 'ended' && auction.winner && (
            <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border border-amber-600/40 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="font-bold text-amber-300">Winner</p>
              <p className="text-white font-black text-lg">{auction.winner?.name}</p>
              <p className="text-amber-400 font-bold">${auction.currentBid?.toLocaleString()}</p>
            </div>
          )}

          <BidForm auction={auction} onBidPlaced={fetchData} />
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
