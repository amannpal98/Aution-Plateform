import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/Notification';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      addToast('Passwords do not match', 'error'); return;
    }
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error'); return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      addToast('Account created! Welcome to BidHub 🎉', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/25">
            <span className="text-3xl font-black text-white">B</span>
          </div>
          <h1 className="text-3xl font-black text-white">Create Account</h1>
          <p className="text-slate-400 mt-2">Join BidHub and start bidding today</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" value={form.name} onChange={handle} required
                placeholder="John Doe" className="input" />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handle} required
                placeholder="you@example.com" className="input" />
            </div>

            <div>
              <label className="label">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'user',   icon: '🙋', title: 'Bidder',     desc: 'Browse & bid on items' },
                  { val: 'seller', icon: '🏷️', title: 'Seller',     desc: 'List items for auction' },
                ].map(({ val, icon, title, desc }) => (
                  <button
                    key={val} type="button"
                    onClick={() => setForm({ ...form, role: val })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.role === val
                        ? 'bg-blue-900/40 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="font-semibold text-sm">{title}</div>
                    <div className="text-xs opacity-70">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handle} required
                  placeholder="Min. 6 characters" className="input pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handle} required
                placeholder="Re-enter your password" className="input" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </span>
              ) : 'Create Account 🚀'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
