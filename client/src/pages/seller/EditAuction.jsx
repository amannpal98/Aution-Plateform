import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuction, updateAuction } from '../../services/api';
import { useNotification } from '../../components/Notification';

const CATEGORIES = ['Electronics','Art','Jewelry','Vehicles','Fashion','Collectibles','Real Estate','Sports','Other'];

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    getAuction(id)
      .then(({ data }) => {
        const a = data.auction;
        setForm({
          title: a.title,
          description: a.description,
          category: a.category,
          startingPrice: a.startingPrice,
          minIncrement: a.minIncrement || 1,
          reservePrice: a.reservePrice || 0,
          endTime: new Date(a.endTime).toISOString().slice(0, 16),
          images: a.images?.length ? a.images : [''],
        });
      })
      .catch(() => navigate('/seller/auctions'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setImage = (i, val) => {
    const imgs = [...form.images]; imgs[i] = val;
    setForm({ ...form, images: imgs });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAuction(id, {
        ...form,
        startingPrice: parseFloat(form.startingPrice),
        minIncrement:  parseFloat(form.minIncrement),
        reservePrice:  parseFloat(form.reservePrice) || 0,
        images: form.images.filter(Boolean),
      });
      addToast('Auction updated!', 'success');
      navigate('/seller/auctions');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!form) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Edit Auction ✏️</h1>
        <p className="text-amber-400 text-sm mt-1">⚠️ You can only edit auctions with no bids</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="card space-y-5">
          <div>
            <label className="label">Title</label>
            <input name="title" value={form.title} onChange={handle} required className="input" />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={handle} className="input cursor-pointer">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handle} required
              className="input resize-none h-32" />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">🖼️ Images</h2>
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input value={img} onChange={(e) => setImage(i, e.target.value)}
                placeholder={`Image URL ${i + 1}`} className="input flex-1" />
              {form.images.length > 1 && (
                <button type="button"
                  onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                  className="btn-danger px-3 py-2 text-sm">✕</button>
              )}
            </div>
          ))}
          {form.images.length < 5 && (
            <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ''] })}
              className="btn-secondary text-sm w-full">+ Add Image</button>
          )}
        </div>

        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Starting Price ($)</label>
              <input name="startingPrice" type="number" value={form.startingPrice} onChange={handle}
                required min="0" step="0.01" className="input" />
            </div>
            <div>
              <label className="label">Min Increment ($)</label>
              <input name="minIncrement" type="number" value={form.minIncrement} onChange={handle}
                min="0" step="0.01" className="input" />
            </div>
          </div>
          <div>
            <label className="label">End Time</label>
            <input name="endTime" type="datetime-local" value={form.endTime} onChange={handle}
              required min={new Date().toISOString().slice(0, 16)} className="input" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/seller/auctions')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuction;
