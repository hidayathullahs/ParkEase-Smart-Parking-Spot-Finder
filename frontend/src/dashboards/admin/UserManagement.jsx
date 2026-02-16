import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Ban } from 'lucide-react';
import AdminService from '../../services/adminService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, DRIVER, PROVIDER, ADMIN
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); // For user details modal

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await AdminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter by role and search query
    let filteredUsers = filter === 'ALL' ? users : users.filter(u => u.role === filter);

    // Apply search filter
    if (searchQuery.trim()) {
        filteredUsers = filteredUsers.filter(u =>
            (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30">ADMIN</span>;
            case 'PROVIDER': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/30">PROVIDER</span>;
            default: return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">DRIVER</span>;
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    const handleBanUser = async (userToBan) => {
        if (!userToBan) return;
        const currentStatus = userToBan.status || 'ACTIVE';
        const targetStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        const confirmMessage = targetStatus === 'BANNED'
            ? `Are you sure you want to ban ${userToBan.name}?`
            : `Are you sure you want to activate ${userToBan.name}?`;

        if (window.confirm(confirmMessage)) {
            try {
                await AdminService.updateUser(userToBan.id, { status: targetStatus });
                // Update local state
                setUsers(users.map(u => u.id === userToBan.id ? { ...u, status: targetStatus } : u));
                if (selectedUser && selectedUser.id === userToBan.id) {
                    setSelectedUser({ ...selectedUser, status: targetStatus });
                }
            } catch (error) {
                console.error("Failed to update user status", error);
                alert("Failed to update status");
            }
        }
    };

    const handleEditClick = () => {
        setEditForm({
            name: selectedUser.name || '',
            role: selectedUser.role || 'USER'
        });
        setIsEditing(true);
    };

    const handleSaveUser = async () => {
        try {
            await AdminService.updateUser(selectedUser.id, editForm);
            // Update local state
            const updatedUser = { ...selectedUser, ...editForm };
            setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
            setSelectedUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Failed to update user");
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-20">
            {/* ... Header and Filters ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-muted-foreground">Manage accounts, roles, and permissions</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                    <option value="ALL">All Roles</option>
                    <option value="DRIVER">Drivers</option>
                    <option value="PROVIDER">Providers</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">
                                            {(user.name || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.name || 'Unknown User'}</div>
                                            <div className="text-sm text-gray-400">{user.email || 'No Email'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${(user.status || 'ACTIVE') === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                                        {user.status || 'ACTIVE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => { setSelectedUser(user); setIsEditing(false); }}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                                            title="View Profile"
                                        >
                                            <User size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleBanUser(user)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition"
                                            title={(user.status || 'ACTIVE') === 'ACTIVE' ? "Ban User" : "Activate User"}
                                        >
                                            <Ban size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-2xl w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {(selectedUser.name || 'U').charAt(0)}
                                </div>
                                <div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-2xl font-bold text-white mb-1 w-full"
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-bold text-white">{selectedUser.name || 'Unknown User'}</h2>
                                    )}
                                    <p className="text-gray-400">{selectedUser.email || 'No Email'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* User Details Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-gray-400 text-sm mb-1">Role</p>
                                {isEditing ? (
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="bg-black/50 border border-white/20 rounded px-2 py-1 text-white w-full"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="DRIVER">DRIVER</option>
                                        <option value="PROVIDER">PROVIDER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                ) : (
                                    <div>{getRoleBadge(selectedUser.role)}</div>
                                )}
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-gray-400 text-sm mb-1">Status</p>
                                <span className={`px-3 py-1 rounded text-sm font-bold ${(selectedUser.status || 'ACTIVE') === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {selectedUser.status || 'ACTIVE'}
                                </span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-gray-400 text-sm mb-1">User ID</p>
                                <p className="text-white font-mono text-sm">{selectedUser.id}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-gray-400 text-sm mb-1">Account Created</p>
                                <p className="text-white text-sm">
                                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSaveUser}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEditClick}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition"
                                    >
                                        Edit User
                                    </button>
                                    <button
                                        onClick={() => handleBanUser(selectedUser)}
                                        className={`flex-1 py-3 rounded-xl font-medium transition border ${(selectedUser.status || 'ACTIVE') === 'ACTIVE' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30'}`}
                                    >
                                        {(selectedUser.status || 'ACTIVE') === 'ACTIVE' ? 'Ban User' : 'Activate User'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
