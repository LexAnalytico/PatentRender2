/**
 * authCache.ts
 * Simple sessionStorage-based cache for auth-related data
 * Used to preserve user authentication state across module reloads and tab switches
 */

const CACHE_KEY_USER_ID = 'auth_user_id_cache';
const CACHE_KEY_DISPLAY_NAME = 'auth_display_name_cache';
const CACHE_TTL = 30 * 1000; // 30 seconds

interface CacheEntry {
  value: string;
  timestamp: number;
}

/**
 * Get cached user ID from sessionStorage if still valid
 */
export function getCachedUserId(): string | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  
  try {
    const cached = sessionStorage.getItem(CACHE_KEY_USER_ID);
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache entry is still valid (within TTL)
    if (now - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY_USER_ID);
      return null;
    }
    
    return entry.value;
  } catch (error) {
    console.error('[authCache] Error reading cached userId:', error);
    return null;
  }
}

/**
 * Cache user ID to sessionStorage
 */
export function setCachedUserId(userId: string): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  
  try {
    const entry: CacheEntry = {
      value: userId,
      timestamp: Date.now()
    };
    sessionStorage.setItem(CACHE_KEY_USER_ID, JSON.stringify(entry));
  } catch (error) {
    console.error('[authCache] Error caching userId:', error);
  }
}

/**
 * Get cached display name from sessionStorage if still valid
 */
export function getCachedDisplayName(): string | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  
  try {
    const cached = sessionStorage.getItem(CACHE_KEY_DISPLAY_NAME);
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache entry is still valid (within TTL)
    if (now - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY_DISPLAY_NAME);
      return null;
    }
    
    return entry.value;
  } catch (error) {
    console.error('[authCache] Error reading cached displayName:', error);
    return null;
  }
}

/**
 * Cache display name to sessionStorage
 */
export function setCachedDisplayName(displayName: string): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  
  try {
    const entry: CacheEntry = {
      value: displayName,
      timestamp: Date.now()
    };
    sessionStorage.setItem(CACHE_KEY_DISPLAY_NAME, JSON.stringify(entry));
  } catch (error) {
    console.error('[authCache] Error caching displayName:', error);
  }
}

/**
 * Clear all auth cache entries
 */
export function clearAuthCache(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  
  try {
    sessionStorage.removeItem(CACHE_KEY_USER_ID);
    sessionStorage.removeItem(CACHE_KEY_DISPLAY_NAME);
  } catch (error) {
    console.error('[authCache] Error clearing auth cache:', error);
  }
}
