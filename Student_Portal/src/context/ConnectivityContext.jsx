import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ConnectivityContext = createContext();

export const useConnectivity = () => useContext(ConnectivityContext);

export const ConnectivityProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncFailed, setSyncFailed] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const callbacksRef = useRef(new Set());

    const registerRetry = useCallback((callback) => {
        callbacksRef.current.add(callback);
        return () => {
            callbacksRef.current.delete(callback);
        };
    }, []);

    const triggerRetry = useCallback(async () => {
        if (!navigator.onLine) return;

        setIsRetrying(true);
        try {
            const promises = Array.from(callbacksRef.current).map(cb => {
                try {
                    return cb();
                } catch (e) {
                    console.error("Retry callback failed:", e);
                    return Promise.resolve();
                }
            });

            await Promise.all(promises);
            setSyncFailed(false);
        } catch (error) {
            console.error("Global retry failed:", error);
        } finally {
            setIsRetrying(false);
        }
    }, [isOnline]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            triggerRetry();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [triggerRetry]);

    const notifySyncFailure = useCallback((failed = true) => {
        setSyncFailed(failed);
    }, []);

    const value = React.useMemo(() => ({
        isOnline,
        syncFailed,
        isRetrying,
        notifySyncFailure,
        registerRetry,
        triggerRetry
    }), [isOnline, syncFailed, isRetrying, notifySyncFailure, registerRetry, triggerRetry]);

    return (
        <ConnectivityContext.Provider value={value}>
            {children}
        </ConnectivityContext.Provider>
    );
};
