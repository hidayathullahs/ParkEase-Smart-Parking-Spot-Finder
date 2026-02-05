import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin,
    CreditCard,
    Clock,
    ChevronRight,
    Car,
    Navigation,
    Ticket,
    Zap,
    TrendingUp,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

// Mock Data for Chart
const spendingData = [
    { name: 'Week 1', amount: 450 },
    { name: 'Week 2', amount: 320 },
    { name: 'Week 3', amount: 550 },
    { name: 'Week 4', amount: 480 },
];

const StatsCard = ({ title, value, subtext, icon: Icon, color, delay }) => (
    <motion.div
        variants={itemVariants}
        className="glass-card p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 ${color}`}>
            <Icon size={80} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-20`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl font-bold text-white mb-2">{value}</div>
            <div className="text-xs text-gray-500">{subtext}</div>
        </div>
    </motion.div>
);

const SmartMapWidget = () => (
    <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden h-64 md:h-full min-h-[250px] border border-white/10 group">
        <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop"
            alt="Live Map"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Live Availability</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Find Spots Near You</h3>
            <p className="text-gray-300 text-sm mb-4">50+ spots available within 2km</p>
            <Link to="/find" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                <MapPin size={18} /> Open Map View
            </Link>
        </div>
    </motion.div>
);

const AIRecommendation = () => (
    <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-blue-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3">
            <div className="px-2 py-1 bg-purple-500/20 rounded text-[10px] font-bold text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Zap size={10} /> AI SUGGESTION
            </div>
        </div>
        <div className="flex items-start gap-4 mt-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/50">
                <Car size={20} className="text-white" />
            </div>
            <div>
                <h4 className="font-bold text-white text-lg">Work Commute?</h4>
                <p className="text-sm text-gray-400 mt-1 mb-3">Based on your history, you usually park at <span className="text-white font-medium">Tech Park Viewer</span> around this time.</p>
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
                    Book Now <ChevronRight size={14} />
                </button>
            </div>
        </div>
    </motion.div>
);

export default function DriverDashboard() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(data);
                const active = data.find(b => b.status === 'ACTIVE' || b.status === 'BOOKED');
                setActiveTicket(active);
            } catch (error) {
                console.error("Error fetching bookings", error);
            }
        };
        if (token) fetchBookings();
    }, [token]);

    const activeCount = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'BOOKED').length;
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-8 p-6 pb-20"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">{user?.name || 'Driver'}</span> 👋
                    </h1>
                    <p className="text-gray-400 text-lg">Ready to find your perfect spot today?</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors relative">
                        <Shield size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <Link to="/wallet" className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
                        <CreditCard size={20} />
                        <span>₹{user?.walletBalance || 0}</span>
                    </Link>
                </div>
            </motion.div>

            {/* Top Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <StatsCard title="Active Bookings" value={activeCount} subtext="View Tickets" icon={Ticket} color="text-blue-400" />
                <StatsCard title="Monthly Spending" value="₹1,250" subtext="+12% from last month" icon={TrendingUp} color="text-pink-400" />

                {/* AI Widget */}
                <AIRecommendation />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Ticket Banner */}
                    <motion.div variants={itemVariants}>
                        {activeTicket ? (
                            <div className="glass-card p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/10 relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-green-400 font-bold tracking-wider text-xs uppercase">Live Session</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{activeTicket.parkingId?.title}</h2>
                                        <p className="text-gray-300 flex items-center gap-2 mb-6">
                                            <MapPin size={16} className="text-blue-400" />
                                            {activeTicket.parkingId?.addressLine || 'Downtown Area'}
                                        </p>

                                        <div className="flex gap-4">
                                            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                                                <Navigation size={18} /> Directions
                                            </button>
                                            <button className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2">
                                                <Clock size={18} /> Extend
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-md border border-white/10 min-w-[150px] text-center flex flex-col justify-center">
                                        <span className="text-gray-400 text-xs uppercase mb-1">Time Remaining</span>
                                        <span className="text-3xl font-mono font-bold text-white">01:45</span>
                                        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-blue-500 h-full w-[70%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <SmartMapWidget />
                        )}
                    </motion.div>

                    {/* Visual Spending Chart */}
                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Spending Analytics</h3>
                            <select className="bg-black/30 border border-white/10 text-white text-sm rounded-lg px-3 py-1 outline-none">
                                <option>This Month</option>
                                <option>Last Month</option>
                            </select>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#93c5fd' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                            <Link to="/driver/history" className="text-blue-400 text-sm hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {bookings.slice(0, 4).map((booking, index) => (
                                <div key={booking.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                        <Car size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium text-sm truncate">{booking.parkingId?.title || 'Parking Spot'}</h4>
                                        <p className="text-gray-500 text-xs">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-white font-bold text-sm">{formatCurrency(booking.totalAmount)}</span>
                                        <span className={`text-[10px] ${booking.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}`}>{booking.status}</span>
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && <p className="text-gray-500 text-center py-4">No recent activity</p>}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
