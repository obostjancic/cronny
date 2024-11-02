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
    key = key ?? createKey(args);

    if (cache.getKey(key) !== undefined) {
      return cache.get(key);
    }

    const result = await fn(...args);
    cache.set(key, result);

    return result;
  };
}

function createKey(args: any[]) {
  for (let arg of args) {
    if (typeof arg === "object") {
      arg = stringify(arg);
    }
  }

  return JSON.stringify(args);
}
