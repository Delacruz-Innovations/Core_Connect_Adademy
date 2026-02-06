import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    // MOCK DATA for Free Access
    const mockUser = { id: 'demo-id', email: 'admin@coreconnect.com' };
    const mockProfile = {
        id: 'demo-id',
        first_name: 'Demo',
        last_name: 'Admin',
        email: 'admin@coreconnect.com',
        role: 'admin',
        is_verified: true
    };

    const [user, setUser] = useState(mockUser);
    const [profile, setProfile] = useState(mockProfile);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setUser(mockUser);
        setProfile(mockProfile);
        return { user: mockUser };
    };

    const logout = async () => {
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
