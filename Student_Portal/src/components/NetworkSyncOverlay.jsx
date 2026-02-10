import React from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import { WifiOff, RefreshCw, AlertTriangle, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NetworkSyncOverlay = () => {
    const { isOnline, syncFailed, isRetrying, triggerRetry } = useConnectivity();

    const showOverlay = !isOnline || syncFailed;

    return (
        <AnimatePresence>
            {showOverlay && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md"
                >
                    <div className="bg-white border-2 border-primary shadow-2xl p-6 flex items-start gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${!isOnline ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                            {!isOnline ? <CloudOff size={24} /> : <AlertTriangle size={24} />}
                        </div>

                        <div className="flex-1 space-y-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                {!isOnline ? 'Connectivity Lost' : 'Sync Interrupted'}
                            </h3>
                            <p className="text-xs font-bold text-gray-900 leading-tight">
                                {!isOnline
                                    ? "You are currently offline. Please check your internet connection."
                                    : "We're having trouble reaching the server. Your progress might not be saved."}
                            </p>

                            <div className="pt-4">
                                <button
                                    onClick={triggerRetry}
                                    disabled={!isOnline || isRetrying}
                                    className={`w-full py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!isOnline || isRetrying
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-primary text-white hover:bg-black active:scale-95'
                                        }`}
                                >
                                    <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
                                    {isRetrying ? 'Re-Syncing System...' : '⚡ Try Re-Connect Now'}
                                </button>

                                {!isOnline && (
                                    <p className="mt-2 text-[8px] font-black text-center text-red-500 uppercase tracking-widest">
                                        Offline Mode Active
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NetworkSyncOverlay;
