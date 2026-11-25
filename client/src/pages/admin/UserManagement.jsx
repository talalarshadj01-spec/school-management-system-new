import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    roleId: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data?.success) {
        setUsers(res.data.users);
        setRoles(res.data.roles);
        if (res.data.roles?.length > 0 && !newUser.roleId) {
          setNewUser((prev) => ({ ...prev, roleId: res.data.roles[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newUser);
      if (res.data?.success) {
        toast.success('User account created successfully');
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.put(`/users/${user.id}/status`, { status: nextStatus });
      if (res.data?.success) {
        toast.success(`User status changed to ${nextStatus}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Accounts & Access Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control, account activations, and system credentials
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowAddModal(true)}>
          Create User Account
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <Loader text="Loading user accounts..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-blue-700">{u.email}</td>
                    <td className="p-3">
                      <span className="font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                        {u.role?.displayName || u.role?.name}
                      </span>
                    </td>
                    <td className="p-3">{u.phone || '-'}</td>
                    <td className="p-3">
                      <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                        {u.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                          u.status === 'active'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create User Account">
        <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="user@school.edu.pk"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role *</label>
              <select
                required
                value={newUser.roleId}
                onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.displayName || r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

