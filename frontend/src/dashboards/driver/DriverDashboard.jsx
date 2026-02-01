import React from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin,
    CreditCard,
    Clock,
    ChevronRight,
    Car,
    Navigation,
    Ticket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatsCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
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
    </div>
);

const SectionHeader = ({ title, linkTo, linkText }) => (
    <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {linkTo && (
            <Link to={linkTo} className="text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors">
                {linkText} <ChevronRight size={16} className="ml-1" />
            </Link>
        )}
    </div>
);

export default function DriverDashboard() {
    const { user } = useAuth();

    // Mock Data - Replace with API calls later
    const activeTicket = {
        id: 'T-123456',
        spotName: 'Downtown Plaza Parking',
        location: '123 Main St, City Center',
        expiresIn: '45 mins',
        status: 'ACTIVE'
    };

    const recentBookings = [
        { id: 1, name: 'Central Mall Parking', date: 'Jan 28, 2026', amount: '₹120', status: 'COMPLETED' },
        { id: 2, name: 'Airport Zone C', date: 'Jan 25, 2026', amount: '₹350', status: 'COMPLETED' }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{user?.name || 'Driver'}</span> 👋
                </h1>
                <p className="text-gray-400">Here's what's happening with your parking today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Wallet Balance"
                    value="₹1,250.00"
                    subtext="Last top-up: Yesterday"
                    icon={CreditCard}
                    color="text-green-400"
                />
                <StatsCard
                    title="Active Bookings"
                    value="1 Active"
                    subtext="Expires in 45 mins"
                    icon={Ticket}
                    color="text-blue-400"
                />
                <StatsCard
                    title="Total Parkings"
                    value="42"
                    subtext="This month"
                    icon={Car}
                    color="text-purple-400"
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Active Ticket & Actions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Ticket Banner */}
                    <div className="glass-card p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold mb-3 border border-green-500/20">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                    ACTIVE NOW
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{activeTicket.spotName}</h3>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <MapPin size={14} className="mr-1" /> {activeTicket.location}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-mono font-bold text-white mb-1">00:45:00</div>
                                <div className="text-xs text-gray-400">Time Remaining</div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center">
                                <Navigation size={18} className="mr-2" /> Navigate
                            </button>
                            <button className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center">
                                <Clock size={18} className="mr-2" /> Extend Time
                            </button>
                        </div>
                    </div>

                    {/* Find Parking CTA */}
                    <Link to="/find" className="group block relative rounded-2xl overflow-hidden h-40">
                        <img
                            src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=2574&auto=format&fit=crop"
                            alt="Find Parking"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent p-8 flex flex-col justify-center">
                            <h3 className="text-2xl font-bold text-white mb-1">Find a Spot Nearby</h3>
                            <p className="text-gray-300 mb-4 text-sm max-w-md">Search for parking spots near you with real-time availability and smart pricing.</p>
                            <span className="text-blue-400 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                                Open Map <ChevronRight size={18} className="ml-1" />
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl h-fit">
                    <SectionHeader title="Recent Activity" linkTo="/driver/history" linkText="View All" />

                    <div className="space-y-4">
                        {recentBookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                                        <Car size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white text-sm">{booking.name}</div>
                                        <div className="text-xs text-gray-500">{booking.date}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white text-sm">{booking.amount}</div>
                                    <div className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                        {booking.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
