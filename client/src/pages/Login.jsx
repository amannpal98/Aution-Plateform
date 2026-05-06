import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/Notification';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Welcome back! 👋', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/25">
            <span className="text-3xl font-black text-white">B</span>
          </div>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your BidHub account</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                name="email" type="email" value={form.email}
                onChange={handle} required
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handle} required
                  placeholder="••••••••"
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 card !p-4 border-dashed border-slate-700">
          <p className="text-xs text-slate-500 text-center font-semibold mb-3">🧪 Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            {[
              { role: 'User',   email: 'user@demo.com',   pw: 'password123' },
              { role: 'Seller', email: 'seller@demo.com', pw: 'password123' },
              { role: 'Admin',  email: 'admin@demo.com',  pw: 'password123' },
            ].map(({ role, email, pw }) => (
              <button
                key={role}
                onClick={() => setForm({ email, password: pw })}
                className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-slate-400 hover:text-white transition-colors"
              >
                <div className="font-bold text-slate-300">{role}</div>
                <div className="truncate">{email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
