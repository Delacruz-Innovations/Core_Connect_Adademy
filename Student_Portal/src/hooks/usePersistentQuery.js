import { useState, useEffect, useCallback, useRef } from 'react';
import { useConnectivity } from '../context/ConnectivityContext';

/**
 * usePersistentQuery
 * A hook that caches Supabase query results in localStorage for offline access
 * and background revalidation.
 * 
 * @param {string} cacheKey - Unique key for localStorage
 * @param {function} fetchFn - Async function that returns data (accepts AbortSignal)
 * @param {array} dependencies - Dependency array for re-fetching
 */
export function usePersistentQuery(cacheKey, fetchFn, dependencies = []) {
    const { isOnline, registerRetry, notifySyncFailure } = useConnectivity();
    const [data, setData] = useState(() => {
        try {
            const cached = localStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            console.warn(`Failed to hydrate cache for ${cacheKey}`, e);
            return null;
        }
    });

    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(null);
    const controllerRef = useRef(null);

    const revalidate = useCallback(async (isBackground = false) => {
        if (!isOnline) {
            setLoading(false);
            return;
        }

        // Abort previous request
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();

        if (!isBackground) setLoading(true);

        try {
            const result = await fetchFn(controllerRef.current.signal);

            // Success: Update cache and state
            setData(result);
            localStorage.setItem(cacheKey, JSON.stringify(result));
            setError(null);
            notifySyncFailure(false);
        } catch (err) {
            // Suppress normal request cancellations
            if (
                err.name === 'AbortError' ||
                err.message?.includes('AbortError') ||
                err.hint?.includes('Request was aborted')
            ) {
                return;
            }

            console.error(`PersistentQuery Error [${cacheKey}]:`, err);
            setError(err);
            notifySyncFailure(true);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [cacheKey, fetchFn, isOnline, notifySyncFailure]);

    useEffect(() => {
        revalidate();

        // Register for global re-sync when online returns
        const unregister = registerRetry(() => revalidate(true));

        return () => {
            if (controllerRef.current) controllerRef.current.abort();
            unregister();
        };
    }, [...dependencies, revalidate, registerRetry]);

    return { data, loading, error, revalidate };
}
