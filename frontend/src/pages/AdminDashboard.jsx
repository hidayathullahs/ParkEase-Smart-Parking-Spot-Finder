import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Users, MapPin, Clock, AlertTriangle, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalParkings: 0,
        pendingApprovals: 0,
        activeParkings: 0,
        totalUsers: 0,
        totalProviders: 0,
        totalBookings: 0
    });
    const [pendingParkings, setPendingParkings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats'),
                axios.get('http://localhost:5000/api/admin/parkings/pending')
            ]);
            setStats(statsRes.data);
            setPendingParkings(pendingRes.data);
        } catch (error) {
            console.error("Admin fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/parkings/${id}/approve`);
            fetchData(); // Refresh list
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason) return alert('Enter a reason');
        try {
            await axios.put(`http://localhost:5000/api/admin/parkings/${id}/reject`, { rejectionReason: rejectReason });
            setRejectingId(null);
            setRejectReason('');
            fetchData();
        } catch (error) {
            alert('Failed to reject');
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading Admin Panel...</div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                Admin Control Center
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<MapPin />} title="Total Parkings" value={stats.totalParkings} color="text-blue-400" />
                <StatCard icon={<Clock />} title="Pending Approval" value={stats.pendingApprovals} color="text-yellow-400" />
                <StatCard icon={<Users />} title="Total Users" value={stats.totalUsers} color="text-green-400" />
                <StatCard icon={<Activity />} title="Active Parkings" value={stats.activeParkings} color="text-purple-400" />

                {/* New Cards for Cars In / Out */}
                <StatCard icon={<Check />} title="Live Occupancy (Cars In)" value={stats.activeBookings || 0} color="text-indigo-400" />
                <StatCard icon={<Clock />} title="Total Bookings Made" value={stats.totalBookings || 0} color="text-pink-400" />
            </div>

            {/* Pending Approvals */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-400" /> Pending Approvals
                </h2>

                {pendingParkings.length === 0 ? (
                    <div className="glass-card p-8 text-center text-gray-400">
                        No pending approvals. All caught up!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingParkings.map(parking => (
                            <div key={parking._id} className="glass-card p-6 rounded-xl flex flex-col md:flex-row gap-6">
                                {/* Image Preview */}
                                <div className="w-full md:w-48 h-32 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                    {parking.images?.[0] ? (
                                        <img src={parking.images[0]} alt={parking.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-600">No Img</div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <h3 className="text-xl font-bold">{parking.name}</h3>
                                        <span className="text-sm text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full bg-yellow-500/10">PENDING</span>
                                    </div>
                                    <p className="text-gray-300 text-sm"><span className="text-gray-500">Address:</span> {parking.address}, {parking.city}</p>
                                    <p className="text-gray-300 text-sm"><span className="text-gray-500">Provider:</span> {parking.provider?.name} ({parking.provider?.email})</p>
                                    <div className="flex gap-4 text-sm mt-2">
                                        <span className="text-gray-400">Rate: <span className="text-white">₹{parking.hourlyRate}/hr</span></span>
                                        <span className="text-gray-400">Ownership: <span className="text-white">{parking.ownership}</span></span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 min-w-[150px] justify-center">
                                    {rejectingId === parking._id ? (
                                        <div className="space-y-2 animate-in fade-in zoom-in">
                                            <input
                                                type="text"
                                                placeholder="Reason..."
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm"
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleReject(parking._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs font-bold">Confirm</button>
                                                <button onClick={() => setRejectingId(null)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 rounded text-xs">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleApprove(parking._id)}
                                                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Check className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(parking._id)}
                                                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                                            >
                                                <X className="w-4 h-4" /> Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="glass-card p-6 rounded-xl flex items-center gap-4">
        <div className={`p-3 rounded-full bg-white/5 ${color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
            <p className="text-gray-400 text-sm uppercase font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;
