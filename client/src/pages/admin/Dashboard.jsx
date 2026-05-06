import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/api';

const StatCard = ({ icon, value, label, color = 'text-white', sub }) => (
  <div className="card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Admin Dashboard 📊</h1>
        <p className="text-slate-400 mt-1">Platform overview and analytics</p>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/admin/users"    className="btn-secondary text-sm">👥 Manage Users</Link>
        <Link to="/admin/auctions" className="btn-secondary text-sm">🏷️ All Auctions</Link>
        <Link to="/seller/create"  className="btn-primary   text-sm">➕ Create Auction</Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Total Users"     value={stats.totalUsers}    color="text-blue-400" />
        <StatCard icon="🏷️" label="Total Auctions"  value={stats.totalAuctions} color="text-violet-400" />
        <StatCard icon="🔨" label="Total Bids"      value={stats.totalBids}     color="text-amber-400" />
        <StatCard icon="💰" label="Platform Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="text-emerald-400" sub="Sum of ended auctions" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="🟢" label="Active Auctions" value={stats.activeAuctions} color="text-emerald-400" />
        <StatCard icon="⏹"  label="Ended Auctions"  value={stats.endedAuctions}  color="text-slate-300" />
        <StatCard icon="📈" label="Bid / Auction"
          value={stats.totalAuctions ? (stats.totalBids / stats.totalAuctions).toFixed(1) : '0'}
          color="text-cyan-400" sub="Avg bids per auction" />
        <StatCard icon="💎" label="Avg Winning Bid"
          value={stats.endedAuctions ? `$${(stats.totalRevenue / stats.endedAuctions).toFixed(0)}` : '$0'}
          color="text-pink-400" sub="Across ended auctions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Auctions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Auctions</h2>
            <Link to="/admin/auctions" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentAuctions.map((a) => (
              <Link key={a._id} to={`/auctions/${a._id}`}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm line-clamp-1">{a.title}</p>
                  <p className="text-xs text-slate-500">by {a.seller?.name} · {a.totalBids} bids</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="font-bold text-amber-400 text-sm">${a.currentBid || a.startingPrice}</p>
                  <span className={`text-xs ${a.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {a.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">By Category</h2>
          <div className="space-y-3">
            {stats.categoryBreakdown.slice(0, 8).map(({ _id, count }) => {
              const pct = stats.totalAuctions ? Math.round((count / stats.totalAuctions) * 100) : 0;
              return (
                <div key={_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{_id || 'Other'}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Users</h2>
          <Link to="/admin/users" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 font-medium pb-3">Name</th>
                <th className="text-left text-slate-400 font-medium pb-3">Email</th>
                <th className="text-left text-slate-400 font-medium pb-3">Role</th>
                <th className="text-left text-slate-400 font-medium pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {stats.recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-white">{u.name}</td>
                  <td className="py-3 text-slate-400">{u.email}</td>
                  <td className="py-3">
                    <span className={`badge border text-xs ${
                      u.role === 'admin'  ? 'bg-red-900/40 text-red-300 border-red-700' :
                      u.role === 'seller' ? 'bg-blue-900/40 text-blue-300 border-blue-700' :
                      'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
