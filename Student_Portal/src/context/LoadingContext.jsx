import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Show loading on route change
        setIsLoading(true);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Minimum loading time for smooth UX

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
