import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <span className="text-white font-black text-base">B</span>
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              Bid<span className="text-blue-400">Hub</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Home</Link>
            <Link to="/auctions" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/auctions') ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Auctions</Link>
            {user?.role === 'seller' && (
              <>
                <Link to="/seller/create" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/seller/create') ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Create</Link>
                <Link to="/seller/auctions" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/seller/auctions') ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>My Listings</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Admin</Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
                  )}
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-20 overflow-hidden">
                      <div className="p-3 border-b border-slate-800">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {(user.role === 'user' || user.role === 'seller' || user.role === 'admin') && (
                          <>
                            <DropItem to="/my-bids" label="My Bids" icon="🔨" onClick={() => setDropdownOpen(false)} />
                            <DropItem to="/won-auctions" label="Won Auctions" icon="🏆" onClick={() => setDropdownOpen(false)} />
                          </>
                        )}
                        {user.role === 'seller' && (
                          <>
                            <DropItem to="/seller/create" label="Create Auction" icon="➕" onClick={() => setDropdownOpen(false)} />
                            <DropItem to="/seller/auctions" label="My Listings" icon="📦" onClick={() => setDropdownOpen(false)} />
                          </>
                        )}
                        {user.role === 'admin' && (
                          <>
                            <DropItem to="/admin" label="Dashboard" icon="📊" onClick={() => setDropdownOpen(false)} />
                            <DropItem to="/admin/users" label="Users" icon="👥" onClick={() => setDropdownOpen(false)} />
                            <DropItem to="/admin/auctions" label="All Auctions" icon="🏷️" onClick={() => setDropdownOpen(false)} />
                            <DropItem to="/seller/create" label="Create Auction" icon="➕" onClick={() => setDropdownOpen(false)} />
                          </>
                        )}
                        <hr className="border-slate-800 my-1" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 text-sm font-medium transition-colors">
                          <span>🚪</span> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-1">
          <MobileLink to="/" label="Home" onClick={() => setMenuOpen(false)} />
          <MobileLink to="/auctions" label="Auctions" onClick={() => setMenuOpen(false)} />
          {user && (
            <>
              <MobileLink to="/my-bids" label="My Bids" onClick={() => setMenuOpen(false)} />
              <MobileLink to="/won-auctions" label="Won Auctions" onClick={() => setMenuOpen(false)} />
            </>
          )}
          {(user?.role === 'seller' || user?.role === 'admin') && (
            <>
              <MobileLink to="/seller/create" label="Create Auction" onClick={() => setMenuOpen(false)} />
              <MobileLink to="/seller/auctions" label="My Listings" onClick={() => setMenuOpen(false)} />
            </>
          )}
          {user?.role === 'admin' && (
            <MobileLink to="/admin" label="Admin Dashboard" onClick={() => setMenuOpen(false)} />
          )}
          <div className="pt-2 border-t border-slate-800">
            {user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 font-medium text-sm">
                🚪 Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const DropItem = ({ to, label, icon, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors">
    <span>{icon}</span>{label}
  </Link>
);

const MobileLink = ({ to, label, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium text-sm transition-colors">
    {label}
  </Link>
);

export default Navbar;
