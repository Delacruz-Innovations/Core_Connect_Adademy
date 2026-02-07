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
                console.error('Auth initialization failed:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // 3. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth event change:', event);

            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                localStorage.removeItem('admin_profile_cache');
            }

            // On refresh, 'INITIAL_SESSION' or similar events might fire.
            // We ensure loading is false.
            setLoading(false);
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
                // Cache it for next refresh
                localStorage.setItem('admin_profile_cache', JSON.stringify(data));
            } else {
                console.warn('Profile fetch issue:', error);
            }
        } catch (error) {
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
