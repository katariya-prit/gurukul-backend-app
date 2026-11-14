interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class FunctionalityCacheService {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly defaultTtlMs = 60 * 1000

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs: number = this.defaultTtlMs): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  invalidate(): void {
    this.cache.clear()
  }
}

export const functionalityCache = new FunctionalityCacheService()
