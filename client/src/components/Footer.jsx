import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-slate-950 border-t border-slate-800 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">B</span>
            </div>
            <span className="font-black text-xl text-white">Bid<span className="text-blue-400">Hub</span></span>
          </div>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            The premier real-time online auction platform. Bid, win, and sell with confidence.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
          <ul className="space-y-2">
            {[['/', 'Home'], ['/auctions', 'Browse Auctions'], ['/register', 'Start Bidding']].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-slate-400 hover:text-white text-sm transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
          <ul className="space-y-2">
            {[['/login', 'Login'], ['/register', 'Register'], ['/my-bids', 'My Bids'], ['/won-auctions', 'Won Auctions']].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-slate-400 hover:text-white text-sm transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} BidHub. All rights reserved.</p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-slate-500 text-sm">Live auctions running</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
