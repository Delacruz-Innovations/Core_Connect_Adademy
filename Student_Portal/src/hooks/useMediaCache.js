import { useState, useCallback } from 'react';

/**
 * useMediaCache
 * A hook for managing large assets in the browser's Cache API.
 */
export function useMediaCache() {
    const [downloading, setDownloading] = useState({});

    const cacheAsset = useCallback(async (url) => {
        if (!url || !('caches' in window)) return;

        const cacheName = 'cc-media-cache-v1';
        const cache = await caches.open(cacheName);

        // Check if already cached
        const matched = await cache.match(url);
        if (matched) return;

        setDownloading(prev => ({ ...prev, [url]: true }));

        try {
            console.log(`[MediaCache] Downloading asset: ${url}`);
            await cache.add(url);
            console.log(`[MediaCache] Asset cached successfully: ${url}`);
        } catch (error) {
            console.warn(`[MediaCache] Failed to cache asset: ${url}`, error);
        } finally {
            setDownloading(prev => {
                const next = { ...prev };
                delete next[url];
                return next;
            });
        }
    }, []);

    const isCached = useCallback(async (url) => {
        if (!url || !('caches' in window)) return false;
        const cache = await caches.open('cc-media-cache-v1');
        const matched = await cache.match(url);
        return !!matched;
    }, []);

    return { cacheAsset, isCached, downloading };
}
