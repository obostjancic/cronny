import type { JSONObject } from "@cronny/types";
import { FlatCache } from "flat-cache";
import { stringify } from "./diff.js";

const cache = new FlatCache({
  ttl: 24 * 60 * 60 * 1000,
  cacheId: "cache",
  persistInterval: 5 * 60 * 1000,
});

export function cached<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  key?: string
) {
  return async (...args: TArgs): Promise<TResult> => {
    const cacheKey = key ?? createKey(args);

    if (cache.getKey(cacheKey) !== undefined) {
      return cache.get(cacheKey) as TResult;
    }

    const result = await fn(...args);
    cache.set(cacheKey, result);

    return result;
  };
}

function createKey(args: unknown[]) {
  return JSON.stringify(
    args.map((arg) => (isJSONObject(arg) ? stringify(arg) : arg))
  );
}

function isJSONObject(value: unknown): value is JSONObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
