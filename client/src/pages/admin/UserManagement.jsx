import React, { useEffect, useState, useCallback } from 'react';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../services/api';
import { useNotification } from '../../components/Notification';
import { useAuth } from '../../context/AuthContext';

const roleBadge = {
  admin:  'bg-red-900/40 text-red-300 border-red-700',
  seller: 'bg-blue-900/40 text-blue-300 border-blue-700',
  user:   'bg-slate-800 text-slate-400 border-slate-700',
};

const UserManagement = () => {
  const { user: me } = useAuth();
  const { addToast } = useNotification();
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingId, setEditingId]   = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ search, role: roleFilter });
      setUsers(data.users);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, role) => {
    try {
      const { data } = await updateAdminUser(userId, { role });
      setUsers((prev) => prev.map((u) => u._id === userId ? data.user : u));
      setEditingId(null);
      addToast('Role updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      const { data } = await updateAdminUser(userId, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => u._id === userId ? data.user : u));
      addToast(`User ${!isActive ? 'activated' : 'deactivated'}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      addToast('User deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">User Management 👥</h1>
        <p className="text-slate-400 mt-1">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input flex-1"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="input w-auto min-w-[140px] cursor-pointer">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No users found</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="text-left text-slate-400 font-medium px-4 py-3">User</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Role</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Joined</th>
                  <th className="text-right text-slate-400 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === u._id ? (
                        <div className="flex gap-1">
                          {['user','seller','admin'].map((r) => (
                            <button key={r} onClick={() => handleRoleChange(u._id, r)}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                u.role === r ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                              }`}>
                              {r}
                            </button>
                          ))}
                          <button onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-white">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => u._id !== me?._id && setEditingId(u._id)}
                          className={`badge border ${roleBadge[u.role]} ${u._id !== me?._id ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          title={u._id !== me?._id ? "Click to change role" : "Can't edit your own role"}>
                          {u.role}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge border text-xs ${u.isActive
                        ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
                        : 'bg-red-900/40 text-red-300 border-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u._id !== me?._id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                              u.isActive
                                ? 'bg-amber-900/30 text-amber-400 border-amber-700 hover:bg-amber-900/50'
                                : 'bg-emerald-900/30 text-emerald-400 border-emerald-700 hover:bg-emerald-900/50'
                            }`}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-900/30 text-red-400 border border-red-700 hover:bg-red-900/50 transition-colors">
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
