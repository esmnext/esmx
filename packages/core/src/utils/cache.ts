/**
 * Type definition for cache handling function
 *
 * @template T - Type of cached data
 * @param name - Unique identifier for the cache item
 * @param fetch - Asynchronous function to fetch data
 * @returns Returns cached data or newly fetched data
 *
 * @example
 * ```ts
 * const cache = createCache(true);
 *
 * // First call will execute the fetch function
 * const data1 = await cache('key', async () => {
 *   return await fetchSomeData();
 * });
 *
 * // Second call will directly return the cached result
 * const data2 = await cache('key', async () => {
 *   return await fetchSomeData();
 * });
 * ```
 */
export type CacheHandle = <T>(
    name: string,
    fetch: () => Promise<T>
) => Promise<T>;

/**
 * Create a cache handling function
 *
 * @param enable - Whether to enable caching functionality
 * @returns Returns a cache handling function
 *
 * @description
 * When enable is true, it creates a processing function with memory cache, the same name will only execute fetch once.
 * When enable is false, each call will execute the fetch function and will not cache the result.
 *
 * @example
 * ```ts
 * // Create a cache-enabled processing function
 * const cacheEnabled = createCache(true);
 *
 * // Create a cache-disabled processing function
 * const cacheDisabled = createCache(false);
 *
 * // Use the cache processing function
 * const result = await cacheEnabled('userProfile', async () => {
 *   return await fetchUserProfile(userId);
 * });
 * ```
 */
export function createCache(enable: boolean) {
    if (enable) {
        const map = new Map<string, any>();
        return async <T>(name: string, fetch: () => Promise<T>): Promise<T> => {
            if (map.has(name)) {
                return map.get(name);
            }
            const result = await fetch();
            map.set(name, result);
            return result;
        };
    }
    return <T>(name: string, fetch: () => Promise<T>): Promise<T> => {
        return fetch();
    };
}
