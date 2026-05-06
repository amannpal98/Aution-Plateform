import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAuction } from '../../services/api';
import { useNotification } from '../../components/Notification';

const CATEGORIES = ['Electronics','Art','Jewelry','Vehicles','Fashion','Collectibles','Real Estate','Sports','Other'];

const CreateAuction = () => {
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultEnd = tomorrow.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Other',
    startingPrice: '', minIncrement: '1', reservePrice: '',
    endTime: defaultEnd,
    images: [''],
  });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const setImage = (i, val) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm({ ...form, images: imgs });
  };

  const addImageField = () => setForm({ ...form, images: [...form.images, ''] });
  const removeImage = (i) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.startingPrice || !form.endTime) {
      addToast('Please fill in all required fields', 'warning'); return;
    }
    if (new Date(form.endTime) <= new Date()) {
      addToast('End time must be in the future', 'warning'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        startingPrice: parseFloat(form.startingPrice),
        minIncrement:  parseFloat(form.minIncrement) || 1,
        reservePrice:  parseFloat(form.reservePrice) || 0,
        images: form.images.filter(Boolean),
      };
      const { data } = await createAuction(payload);
      addToast('Auction created successfully! 🎉', 'success');
      navigate(`/auctions/${data.auction._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create auction', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Create Auction</h1>
        <p className="text-slate-400 mt-1">List your item and start receiving bids</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">📝 Listing Details</h2>

          <div>
            <label className="label">Title <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handle} required
              placeholder="e.g. Vintage Rolex Submariner 1969" className="input" maxLength={100} />
            <p className="text-xs text-slate-500 mt-1">{form.title.length}/100</p>
          </div>

          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={handle} className="input cursor-pointer">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <textarea name="description" value={form.description} onChange={handle} required
              placeholder="Describe your item in detail — condition, history, dimensions, etc."
              className="input resize-none h-32" maxLength={2000} />
            <p className="text-xs text-slate-500 mt-1">{form.description.length}/2000</p>
          </div>
        </div>

        {/* Images */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">🖼️ Images</h2>
          <p className="text-xs text-slate-500">Paste image URLs (Unsplash, Imgur, etc.)</p>
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={img} onChange={(e) => setImage(i, e.target.value)}
                placeholder={`Image URL ${i + 1}`} className="input flex-1" />
              {form.images.length > 1 && (
                <button type="button" onClick={() => removeImage(i)}
                  className="btn-danger px-3 py-2 text-sm">✕</button>
              )}
            </div>
          ))}
          {form.images.length < 5 && (
            <button type="button" onClick={addImageField}
              className="btn-secondary text-sm w-full">+ Add Image URL</button>
          )}
          {/* Preview */}
          {form.images.filter(Boolean).length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {form.images.filter(Boolean).map((url, i) => (
                <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="card space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">💰 Pricing</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Starting Price ($) <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
                <input name="startingPrice" type="number" value={form.startingPrice} onChange={handle}
                  required min="0" step="0.01" placeholder="0.00" className="input pl-9" />
              </div>
            </div>
            <div>
              <label className="label">Min Bid Increment ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
                <input name="minIncrement" type="number" value={form.minIncrement} onChange={handle}
                  min="0" step="0.01" placeholder="1.00" className="input pl-9" />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Reserve Price ($) <span className="text-slate-500 text-xs">(optional)</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
              <input name="reservePrice" type="number" value={form.reservePrice} onChange={handle}
                min="0" step="0.01" placeholder="0.00" className="input pl-9" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Minimum price you're willing to accept</p>
          </div>
        </div>

        {/* Timing */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">⏰ Auction Duration</h2>

          {/* Quick duration buttons */}
          <div>
            <label className="label">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '1 Hour',  hours: 1 },
                { label: '6 Hours', hours: 6 },
                { label: '1 Day',   hours: 24 },
                { label: '3 Days',  hours: 72 },
                { label: '7 Days',  hours: 168 },
              ].map(({ label, hours }) => (
                <button key={label} type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setHours(d.getHours() + hours);
                    setForm({ ...form, endTime: d.toISOString().slice(0, 16) });
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Custom End Date & Time <span className="text-red-400">*</span></label>
            <input name="endTime" type="datetime-local" value={form.endTime} onChange={handle}
              required min={new Date().toISOString().slice(0, 16)} className="input" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating Auction…
            </span>
          ) : '🚀 Create Auction'}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;
