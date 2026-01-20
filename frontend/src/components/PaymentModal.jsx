import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Loader2, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, amount, onPaymentComplete }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, success, error

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
        }
    }, [isOpen]);

    const handlePay = () => {
        setStatus('processing');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                onPaymentComplete();
            }, 1000);
        }, 2500); // 2.5s simulated delay
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <AnimatePresence>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1a1b1e] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        disabled={status === 'processing' || status === 'success'}
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <CreditCard className="text-blue-400" /> Secure Payment
                    </h2>

                    <div className="space-y-6">
                        {/* Amount Card */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 mx-auto text-center">
                            <p className="text-white/60 text-sm mb-1">Total Amount</p>
                            <h3 className="text-3xl font-bold text-white">₹{amount}</h3>
                        </div>

                        {/* Payment Method Dummy */}
                        <div className="space-y-3">
                            <p className="text-sm text-white/60 font-medium pl-1">Payment Method</p>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 cursor-pointer transition ring-1 ring-blue-500">
                                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-white">MasterCard •••• 4242</p>
                                </div>
                                <CheckCircle size={16} className="text-blue-400" />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handlePay}
                            disabled={status !== 'idle'}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${status === 'success' ? 'bg-green-500 text-white' :
                                    status === 'processing' ? 'bg-blue-600/50 cursor-not-allowed' :
                                        'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 hover:scale-[1.02]'
                                }`}
                        >
                            {status === 'idle' && (
                                <>Pay Now <ShieldCheck size={20} /></>
                            )}
                            {status === 'processing' && (
                                <><Loader2 className="animate-spin" /> Processing...</>
                            )}
                            {status === 'success' && (
                                <><CheckCircle /> Payment Successful</>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-xs text-white/30 mt-6 flex items-center justify-center gap-1">
                        <ShieldCheck size={12} /> Encrypted & Secure Connection
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default PaymentModal;
