import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Truck, Clock, AlertCircle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

// Animations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

// Mock Data
const occupancyData = [
    { name: 'Mon', count: 40 },
    { name: 'Tue', count: 30 },
    { name: 'Wed', count: 55 },
    { name: 'Thu', count: 45 },
    { name: 'Fri', count: 80 },
    { name: 'Sat', count: 95 },
    { name: 'Sun', count: 70 },
];

export default function OwnerDashboard() {
    const [stats, setStats] = useState({
        totalSpots: 0,
        activeBookings: 0,
        todayEarnings: 0,
        monthlyEarnings: 0
    });
    const { token } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [listingsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/provider/listings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                const totalSpots = listingsRes.data?.length || 0;
                setStats({
                    totalSpots,
                    activeBookings: Math.floor(Math.random() * 10), // Mock
                    todayEarnings: Math.floor(Math.random() * 2000), // Mock
                    monthlyEarnings: Math.floor(Math.random() * 50000) // Mock
                });
            } catch (error) {
                console.error("Error fetching provider data", error);
            }
        };
        if (token) fetchDashboardData();
    }, [token]);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
                    <p className="text-muted-foreground">Manage your parking spots and earnings</p>
                </div>
                <Link to="/owner/add-parking" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <PlusCircle size={20} className="relative z-10" />
                    <span className="relative z-10">Add New Parking</span>
                </Link>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Total Listings", value: stats.totalSpots, icon: Truck, color: "text-blue-400" },
                    { title: "Active Bookings", value: stats.activeBookings, icon: Clock, color: "text-purple-400" },
                    { title: "Today's Earnings", value: `₹${stats.todayEarnings}`, icon: CheckCircle, color: "text-green-400" },
                    { title: "Monthly Earnings", value: `₹${stats.monthlyEarnings}`, icon: TrendingUp, color: "text-pink-400" }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all"
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon size={60} />
                        </div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Occupancy Chart */}
                <motion.div variants={itemVariants} className="md:col-span-2 glass-card p-6 rounded-3xl border border-white/10 bg-black/40">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Weekly Occupancy</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={occupancyData}>
                                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10 bg-black/40">
                        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link to="/owner/add-parking" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition group border border-white/5">
                                <span className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><PlusCircle size={20} /></div>
                                    Add New Parking
                                </span>
                                <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                            <Link to="/owner/parkings" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition group border border-white/5">
                                <span className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><Edit size={20} /></div>
                                    Manage Listings
                                </span>
                                <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Users size={20} className="text-blue-400" />
                            <h3 className="font-bold text-white">Pro Tip</h3>
                        </div>
                        <p className="text-sm text-gray-400">
                            Adding high-quality photos increases your booking rate by <strong>40%</strong>.
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
