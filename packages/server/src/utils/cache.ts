import { FlatCache } from "flat-cache";
import { stringify } from "./diff.js";
import { createLogger } from "./logger.js";

const logger = createLogger("cache");

const cache = new FlatCache({
  ttl: 24 * 60 * 60 * 1000,
  cacheId: "cache",
  persistInterval: 5 * 60 * 1000,
});

export function cached(fn: Function, key?: string) {
  return async (...args: any[]) => {
    const cacheKey = key ?? createKey(args);

    if (cache.getKey(cacheKey) !== undefined) {
      return cache.get(cacheKey);
    }

    const result = await fn(...args);
    cache.set(cacheKey, result);

    return result;
  };
}

function createKey(args: any[]) {
  return JSON.stringify(
    args.map((arg) => (typeof arg === "object" ? stringify(arg) : arg))
  );
}
