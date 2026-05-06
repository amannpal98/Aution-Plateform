import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuctions } from '../services/api';
import AuctionCard from '../components/AuctionCard';

const CATEGORIES = ['Electronics', 'Art', 'Jewelry', 'Vehicles', 'Fashion', 'Collectibles', 'Sports'];

const StatCard = ({ icon, value, label }) => (
  <div className="text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-3xl font-black text-white">{value}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
);

const Home = () => {
  const [featured, setFeatured]     = useState([]);
  const [ending,   setEnding]       = useState([]);
  const [loading,  setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, e] = await Promise.all([
          getAuctions({ status: 'active', sort: 'popular', limit: 4 }),
          getAuctions({ status: 'active', sort: 'ending',  limit: 4 }),
        ]);
        setFeatured(f.data.auctions);
        setEnding(e.data.auctions);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 px-4 py-2 rounded-full text-sm text-blue-300 font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live Auctions Happening Now
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight tracking-tight">
            Bid Smart.<br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Win Big.
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The real-time auction platform where every second counts. Find unique items, place live bids, and win incredible deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auctions" className="btn-gold text-lg px-8 py-4 rounded-2xl">
              🔨 Browse Auctions
            </Link>
            <Link to="/register" className="btn-secondary text-lg px-8 py-4 rounded-2xl">
              Start Selling →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-slate-800 max-w-2xl mx-auto">
            <StatCard icon="🔨" value="10K+" label="Live Auctions" />
            <StatCard icon="👥" value="50K+" label="Bidders" />
            <StatCard icon="🏆" value="$2M+" label="Items Sold" />
            <StatCard icon="⚡" value="Real-time" label="Bidding" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/auctions?category=${cat}`}
                className="bg-slate-900 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-600/50 rounded-xl p-4 text-center transition-all duration-200 group"
              >
                <div className="text-2xl mb-2">{catIcon(cat)}</div>
                <p className="text-xs font-semibold text-slate-400 group-hover:text-blue-400 transition-colors">{cat}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white">🔥 Most Popular</h2>
              <p className="text-slate-400 text-sm mt-1">Highest bid activity right now</p>
            </div>
            <Link to="/auctions?sort=popular" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
              View all →
            </Link>
          </div>

          {loading ? <AuctionSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((a) => <AuctionCard key={a._id} auction={a} />)}
              {featured.length === 0 && <NoItems text="No active auctions yet." />}
            </div>
          )}
        </div>
      </section>

      {/* Ending Soon */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white">⏰ Ending Soon</h2>
              <p className="text-slate-400 text-sm mt-1">Last chance to place your bid</p>
            </div>
            <Link to="/auctions?sort=ending" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
              View all →
            </Link>
          </div>

          {loading ? <AuctionSkeleton /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ending.map((a) => <AuctionCard key={a._id} auction={a} />)}
              {ending.length === 0 && <NoItems text="No auctions ending soon." />}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-black text-white">Ready to Start Selling?</h2>
          <p className="text-slate-400 text-lg">Register as a seller and list your items in minutes. Reach thousands of eager bidders.</p>
          <Link to="/register" className="btn-primary text-lg px-10 py-4 rounded-2xl inline-block">
            Create Seller Account →
          </Link>
        </div>
      </section>
    </div>
  );
};

const catIcon = (cat) => ({ Electronics: '💻', Art: '🎨', Jewelry: '💎', Vehicles: '🚗', Fashion: '👗', Collectibles: '🏺', Sports: '⚽' }[cat] || '📦');

const AuctionSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
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
);

const NoItems = ({ text }) => (
  <div className="col-span-4 text-center py-16 text-slate-500">{text}</div>
);

export default Home;
