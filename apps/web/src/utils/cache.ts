/**
 * Intelligent Caching Utilities
 * Sprint 5.5 - Performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private storage: Map<string, CacheItem<any>> = new Map();
  private maxSize: number = 100;

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest if max size reached
    if (this.storage.size >= this.maxSize) {
      const firstKey = this.storage.keys().next().value;
      if (firstKey !== undefined) {
        this.storage.delete(firstKey);
      }
    }

    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.storage.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  // Get all valid (non-expired) keys
  keys(): string[] {
    const validKeys: string[] = [];
    this.storage.forEach((item, key) => {
      if (Date.now() - item.timestamp <= item.ttl) {
        validKeys.push(key);
      }
    });
    return validKeys;
  }
}

export const cache = new Cache();

/**
 * LocalStorage cache with expiration
 */
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'chef-cache') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }

  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.getKey(key));
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Check expiration
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return null;
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export const localStorageCache = new LocalStorageCache();

/**
 * Memoize async function with cache
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: { ttl?: number; keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  const { ttl = 5 * 60 * 1000, keyFn = (...args) => JSON.stringify(args) } = options;

  return (async (...args: Parameters<T>) => {
    const key = keyFn(...args);
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  }) as T;
}
