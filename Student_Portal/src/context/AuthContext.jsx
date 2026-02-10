import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(() => {
        // Hydrate profile from localStorage on boot
        try {
            const cached = localStorage.getItem('cc_student_profile');
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            return null;
        }
    });
    const [authStatus, setAuthStatus] = useState('loading');

    useEffect(() => {
        let mounted = true;

        const handleAuth = async (session) => {
            if (!session) {
                if (mounted) {
                    setUser(null);
                    setProfile(null);
                    localStorage.removeItem('cc_student_profile');
                    setAuthStatus('unauthenticated');
                }
                return;
            }

            if (mounted) {
                setUser(session.user);
                // Set authenticated status immediately so the app can render
                setAuthStatus('authenticated');
            }

            try {
                // Fetch profile in background
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (mounted && data && !error) {
                    setProfile(data);
                    localStorage.setItem('cc_student_profile', JSON.stringify(data));
                }
            } catch (err) {
                console.warn('🔇 Profile sync error (ignoring):', err);
            }
        };

        // Suppress AbortError which is common in Strict Mode with Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuth(session).catch(err => {
                if (err.name === 'AbortError') return;
                console.error('❌ Auth listener error:', err);
            });
        });

        // Initial check in case onAuthStateChange is late
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted && authStatus === 'loading') {
                handleAuth(session);
            }
        }).catch(err => {
            if (err.name === 'AbortError') return;
            if (mounted) setAuthStatus('unauthenticated');
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        setAuthStatus('loading');
        localStorage.removeItem('cc_student_profile');
        await supabase.auth.signOut();
        // onAuthStateChange will handle the remaining state updates
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                authStatus,
                loading: authStatus === 'loading',
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
