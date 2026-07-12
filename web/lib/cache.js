const store = new Map();

/**
 * In-memory TTL cache (per process). No Redis.
 * @param {string} key
 * @param {() => Promise<T>} fn
 * @param {{ ttlMs?: number }} [options]
 * @returns {Promise<T>}
 * @template T
 */
export async function cached(key, fn, options = {}) {
  const ttlMs = options.ttlMs ?? 60_000;
  const now = Date.now();
  const hit = store.get(key);

  if (hit && hit.expiresAt > now) {
    return hit.value;
  }

  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidateCache(prefix = "") {
  for (const key of store.keys()) {
    if (!prefix || key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
