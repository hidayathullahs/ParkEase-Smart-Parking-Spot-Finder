import React from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const OwnerProfile = () => {
    const { user } = useAuth();

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">My Profile</h1>
                <p className="text-muted-foreground">Manage your account settings</p>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user?.name || 'Provider User'}</h2>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">
                            PROVIDER
                        </span>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-gray-300">
                        <Mail className="text-gray-500" />
                        <span>{user?.email || 'email@example.com'}</span>
                    </div>
                    {/* Add more fields as needed */}
                </div>
            </div>
        </div>
    );
};

export default OwnerProfile;
