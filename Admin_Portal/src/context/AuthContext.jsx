import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    if (session?.user) {
                        setUser(session.user);
                    } else {
                        setUser(null);
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' || err.code === 20 || err.message?.includes('aborted')) {
                    return;
                }
                console.error('Auth initialization failed:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('🔄 Auth Event:', event, session?.user?.email);

            if (session?.user) {
                setUser(session.user);
            } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setUser(null);
            }

            if (event !== 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        // Safety timeout
        const safetyTimeout = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 3000);

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('admin_profile_cache'); // Cleanup legacy cache
    };

    // Derive admin status directly from authorized email
    const isAdmin = user?.email === 'delacruzltd.sam@gmail.com';

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
