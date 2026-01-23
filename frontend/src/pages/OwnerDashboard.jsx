import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, MapPin, Edit, Truck, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
    const [stats, setStats] = useState({
        totalSpots: 0,
        activeBookings: 0,
        todayEarnings: 0,
        monthlyEarnings: 0
    });

    // Using listings from the new backend
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch listings and stats in parallel
                const [listingsRes, statsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/provider/parkings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/provider/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setListings(listingsRes.data.list || []);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching provider data", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDashboardData();
    }, [token]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'REJECTED': return <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> Rejected</span>;
            default: return <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs flex items-center gap-1"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
                    <p className="text-muted-foreground">Manage your parking spots and earnings</p>
                </div>
                <Link to="/owner/add-parking" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition">
                    <PlusCircle size={20} />
                    Add New Parking
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-2">
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                    <p className="text-2xl font-bold">{stats.totalSpots}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-2">
                    <p className="text-sm text-muted-foreground">Active Bookings</p>
                    <p className="text-2xl font-bold">{stats.activeBookings}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-2">
                    <p className="text-sm text-muted-foreground">Today's Earnings</p>
                    <p className="text-2xl font-bold text-green-400">₹{stats.todayEarnings}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-2">
                    <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                    <p className="text-2xl font-bold text-blue-400">₹{stats.monthlyEarnings}</p>
                </div>
            </div>

            {/* Listings */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Your Parking Spots</h2>
                {loading ? (
                    <div className="text-center py-10">Loading listings...</div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
                        <Truck size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">No parking spots listed yet.</p>
                        <Link to="/owner/add-parking" className="text-blue-400 hover:underline mt-2 inline-block">Add your first spot</Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((spot) => (
                            <div key={spot._id} className="glass-card group hover:bg-white/5 transition border border-white/10 rounded-2xl overflow-hidden relative">
                                <div className="h-40 bg-gray-800 relative">
                                    <img src={spot.images?.[0] || 'https://via.placeholder.com/400x200'} alt={spot.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2">
                                        {getStatusBadge(spot.status)}
                                    </div>
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono">
                                        ₹{spot.pricing?.hourlyRate}/hr
                                    </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight mb-1">{spot.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <MapPin size={14} /> {spot.city}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 bg-black/20 p-3 rounded-lg">
                                        <div>
                                            <span className="block text-xs text-muted-foreground">Capacity</span>
                                            <span className="font-semibold text-white">~{spot.approxTotalCars} Cars</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-muted-foreground">Area</span>
                                            <span className="font-semibold text-white">{spot.dimensions?.totalArea} m²</span>
                                        </div>
                                    </div>

                                    {spot.status === 'REJECTED' && (
                                        <div className="text-xs bg-red-500/10 text-red-300 p-2 rounded border border-red-500/20">
                                            <strong>Reason:</strong> {spot.rejectionReason}
                                        </div>
                                    )}

                                    <div className="pt-2 flex gap-2">
                                        <button className="flex-1 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 rounded-lg transition">
                                            View Details
                                        </button>
                                        <button className="p-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition">
                                            <Edit size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
