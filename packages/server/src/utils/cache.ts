import { FlatCache } from "flat-cache";

const cache = new FlatCache({ ttl: 24 * 60 * 60, cacheDir: "../../.data/" });

export default {
  get: <T>(key: string) => cache.get(key) as T,
  set: <T>(key: string, value: T) => cache.set(key, value),
};

export function cached(fn: Function) {
  return async (...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.get(key)) {
      return cache.get(key);
    }

    const result = await fn(...args);
    cache.set(key, result);

    return result;
  };
}
