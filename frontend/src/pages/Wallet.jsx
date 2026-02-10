import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, History } from 'lucide-react';
import axios from 'axios';

const WalletPage = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')) || {});
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAddMoney = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
            };

            // Process transaction delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/auth/profile`, {
                addFunds: amount
            }, config);

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);

            setMessage(`Successfully added ₹${amount}!`);
            setAmount('');
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Failed to add funds.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                My Payment Wallet
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 bg-gradient-to-br from-blue-900/60 to-purple-900/60 border-blue-500/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className="text-sm font-medium text-blue-200 uppercase tracking-wider">Total Balance</h4>
                                    <h2 className="text-5xl font-bold text-white mt-2">${user.walletBalance || 0}.00</h2>
                                </div>
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <Wallet size={32} className="text-white" />
                                </div>
                            </div>

                            <div className="bg-black/20 p-4 rounded-xl backdrop-blur-md mb-6 border border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">ParkEase Pass</span>
                                    <span className="text-green-400 font-bold">Active</span>
                                </div>
                            </div>

                            <form onSubmit={handleAddMoney} className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-blue-500 transition"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : <><Plus size={20} /> Add Funds</>}
                                </button>
                            </form>
                            {message && <p className={`text - sm mt - 3 text - center ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 min-h-[500px]">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                            <History className="text-blue-400" size={24} />
                            <h3 className="text-xl font-bold">Transaction History</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-4">
                                {(user.transactions && user.transactions.length > 0) ? (
                                    [...user.transactions].reverse().map((tx, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w - 12 h - 12 rounded - full flex items - center justify - center ${tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{tx.desc}</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text - lg font - bold ${tx.type === 'credit' ? 'text-green-400' : 'text-white'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No transactions yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
