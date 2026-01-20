import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeRole, setActiveRole] = useState('USER');

    // Safety check: Ensure useAuth exists before destructuring
    const auth = useAuth();
    const { login, googleLogin } = auth || {};

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!login) {
            setError("Auth System Error: Login function not found.");
            return;
        }

        try {
            const res = await login(email, password);
            if (!res.success) {
                setError(res.message);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            console.error(err);
        }
    };

    const tabs = [
        { id: 'USER', label: 'Driver' },
        { id: 'PROVIDER', label: 'Space Owner' },
        { id: 'ADMIN', label: 'Admin' }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[100px]" />

            <div className="glass-card p-8 w-full max-w-md z-10 border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Welcome Back
                </h2>

                {/* Role Tabs */}
                <div className="flex p-1 bg-black/20 rounded-xl mb-6 border border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveRole(tab.id)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeRole === tab.id
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center border border-red-500/50">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={activeRole === 'ADMIN' ? "admin@parkease.com" : "you@example.com"}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
                        <input
                            type="password"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <div className="flex justify-end mt-1">
                            <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02] shadow-lg">
                        Login as {tabs.find(t => t.id === activeRole)?.label}
                    </button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/40 px-2 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                if (googleLogin) {
                                    const res = await googleLogin(credentialResponse.credential);
                                    if (!res.success) {
                                        setError(res.message);
                                    }
                                } else {
                                    setError("Google Login not initialized");
                                }
                            }}
                            onError={() => {
                                console.error('Google Login Error triggered');
                                setError('Google Login Failed.');
                            }}
                            theme="filled_black"
                            shape="circle"
                        />
                    </div>
                </form>

                <p className="text-center mt-6 text-gray-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Sign up</Link>
                </p>

            </div>
        </div>
    );
};

export default Login;
