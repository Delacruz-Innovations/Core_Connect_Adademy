import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminSignup = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white p-12 shadow-2xl border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8">
                        <ShieldAlert size={40} />
                    </div>

                    <h1 className="text-2xl font-black text-black italic uppercase tracking-tight mb-4">
                        Registration Restricted
                    </h1>

                    <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                        In accordance with the <span className="text-black font-bold">Canonical Admin Auth State Machine</span>,
                        public administrative signup is strictly prohibited.
                        Identity creation must be performed via authorized system bootstrap.
                    </p>

                    <Link
                        to="/admin/login"
                        className="w-full bg-black text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-3"
                    >
                        <ArrowLeft size={16} /> Return to Login
                    </Link>
                </div>

                <p className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    System Law v1.0 — Frozen
                </p>
            </div>
        </div>
    );
};

export default AdminSignup;
