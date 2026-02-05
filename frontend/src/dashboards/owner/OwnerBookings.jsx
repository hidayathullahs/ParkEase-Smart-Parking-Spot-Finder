import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const OwnerBookings = () => {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Bookings & Reservations</h1>
                    <p className="text-muted-foreground">View and manage upcoming customer arrivals</p>
                </div>
            </div>

            <div className="glass-card p-12 rounded-2xl border border-white/10 text-center text-gray-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                <p>When drivers book your spots, they will appear here.</p>
            </div>
        </div>
    );
};

export default OwnerBookings;
