import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Check Local Storage Cache first for faster UI recovery
                const cachedProfile = localStorage.getItem('admin_profile_cache');
                if (cachedProfile && mounted) {
                    setProfile(JSON.parse(cachedProfile));
                }

                // 2. Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    if (session?.user) {
                        setUser(session.user);
                        await fetchProfile(session.user.id);
                    } else {
                        setUser(null);
                        setProfile(null);
                        localStorage.removeItem('admin_profile_cache');
                    }
                }
            } catch (err) {
                // Ignore AbortError - it's noise from fast refreshes or navigation
                if (err.name === 'AbortError' || err.code === 20 || err.message?.includes('aborted')) {
                    return;
                }
                console.error('Auth initialization failed:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // 3. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('🔄 Auth Event:', event, session?.user?.email);

            if (session?.user) {
                setUser(session.user);
                // Only trigger profile fetch on actual sign-in or refresh
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    await fetchProfile(session.user.id);
                }
            } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setUser(null);
                setProfile(null);
                localStorage.removeItem('admin_profile_cache');
            }

            // ONLY set loading to false if we've already done the mount-time 'initializeAuth'
            // or if it's a definitive event.
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

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data);
                localStorage.setItem('admin_profile_cache', JSON.stringify(data));
            } else {
                // Ignore abort errors
                if (error?.message?.includes('aborted') || error?.code === '20' || error?.name === 'AbortError') {
                    return;
                }
                console.warn('Profile fetch issue:', error);
            }
        } catch (error) {
            if (error.name === 'AbortError' || error.message?.includes('aborted')) return;
            console.error('Profile error:', error);
        }
    };

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
        setProfile(null);
        localStorage.removeItem('admin_profile_cache');
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
