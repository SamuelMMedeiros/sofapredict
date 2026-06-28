import { eq, lt } from "drizzle-orm";
import { apiCache, InsertApiCache } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Cache configuration with TTL in seconds
 */
export const CACHE_TTL = {
  MATCHES: parseInt(process.env.CACHE_TTL_MATCHES || "300"), // 5 minutes
  TEAM_STATS: parseInt(process.env.CACHE_TTL_TEAM_STATS || "3600"), // 1 hour
  GEMINI_ANALYSIS: parseInt(process.env.CACHE_TTL_GEMINI || "7200"), // 2 hours
  STANDINGS: parseInt(process.env.CACHE_TTL_STANDINGS || "3600"), // 1 hour
};

/**
 * Generate a cache key from parameters
 */
export function generateCacheKey(source: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join("|");
  return `${source}:${sortedParams}`;
}

/**
 * Get cached data if it exists and hasn't expired
 */
export async function getCachedData(cacheKey: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(apiCache)
      .where(eq(apiCache.cacheKey, cacheKey))
      .limit(1);

    if (result.length === 0) return null;

    const cached = result[0];
    const now = new Date();

    // Check if cache has expired
    if (cached.expiresAt && new Date(cached.expiresAt) < now) {
      // Delete expired cache
      await db.delete(apiCache).where(eq(apiCache.cacheKey, cacheKey));
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error("[Cache] Error retrieving cached data:", error);
    return null;
  }
}

/**
 * Store data in cache with TTL
 */
export async function setCachedData(
  cacheKey: string,
  data: any,
  source: "rapidapi" | "gemini" | "sofascore" | "betminer",
  ttlSeconds: number
) {
  const db = await getDb();
  if (!db) return false;

  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await db
      .insert(apiCache)
      .values({
        cacheKey,
        source,
        data,
        expiresAt,
      } as InsertApiCache)
      .onDuplicateKeyUpdate({
        set: {
          data,
          expiresAt,
        },
      });

    return true;
  } catch (error) {
    console.error("[Cache] Error storing cached data:", error);
    return false;
  }
}

/**
 * Clear expired cache entries (should be called periodically)
 */
export async function clearExpiredCache() {
  const db = await getDb();
  if (!db) return 0;

  try {
    await db
      .delete(apiCache)
      .where(lt(apiCache.expiresAt, new Date()));

    return 0;
  } catch (error) {
    console.error("[Cache] Error clearing expired cache:", error);
    return 0;
  }
}

/**
 * Invalidate cache by key pattern
 */
export async function invalidateCachePattern(pattern: string) {
  const db = await getDb();
  if (!db) return 0;

  try {
    // This is a simple implementation - in production, consider using LIKE queries
    const allCache = await db.select().from(apiCache);
    const toDelete = allCache.filter(c => c.cacheKey.includes(pattern));

    if (toDelete.length === 0) return 0;

    for (const cache of toDelete) {
      await db.delete(apiCache).where(eq(apiCache.cacheKey, cache.cacheKey));
    }

    return toDelete.length;
  } catch (error) {
    console.error("[Cache] Error invalidating cache pattern:", error);
    return 0;
  }
}


/**
 * Wrapper for cached API calls
 */
export async function withCache<T>(
  cacheKey: string,
  source: "rapidapi" | "gemini" | "sofascore" | "betminer",
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await getCachedData(cacheKey);
  if (cached) {
    console.log(`[Cache] Hit for key: ${cacheKey}`);
    return cached as T;
  }

  // Cache miss - fetch fresh data
  console.log(`[Cache] Miss for key: ${cacheKey}`);
  const data = await fetchFn();

  // Store in cache
  await setCachedData(cacheKey, data, source, ttlSeconds);

  return data;
}
