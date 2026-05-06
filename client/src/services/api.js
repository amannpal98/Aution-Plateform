import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here; let ProtectedRoute handle it
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const registerUser    = (data)  => API.post('/api/auth/register', data);
export const loginUser       = (data)  => API.post('/api/auth/login', data);
export const getMe           = ()      => API.get('/api/auth/me');
export const updateProfile   = (data)  => API.put('/api/auth/profile', data);

// ─── AUCTIONS ─────────────────────────────────────────────────────────────────
export const getAuctions     = (params) => API.get('/api/auctions', { params });
export const getAuction      = (id)     => API.get(`/api/auctions/${id}`);
export const createAuction   = (data)   => API.post('/api/auctions', data);
export const updateAuction   = (id, data) => API.put(`/api/auctions/${id}`, data);
export const deleteAuction   = (id)     => API.delete(`/api/auctions/${id}`);
export const getMyAuctions   = ()       => API.get('/api/auctions/seller/my');

// ─── BIDS ─────────────────────────────────────────────────────────────────────
export const placeBid        = (data)   => API.post('/api/bids', data);
export const getAuctionBids  = (id)     => API.get(`/api/bids/${id}`);
export const getUserBids     = ()       => API.get('/api/bids/user/history');
export const getWonAuctions  = ()       => API.get('/api/bids/user/won');

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const getAdminStats   = ()       => API.get('/api/admin/stats');
export const getAdminUsers   = (params) => API.get('/api/admin/users', { params });
export const updateAdminUser = (id, data) => API.put(`/api/admin/users/${id}`, data);
export const deleteAdminUser = (id)     => API.delete(`/api/admin/users/${id}`);
export const getAdminAuctions= (params) => API.get('/api/admin/auctions', { params });
export const featureAuction  = (id)     => API.put(`/api/admin/auctions/${id}/feature`);

export default API;
