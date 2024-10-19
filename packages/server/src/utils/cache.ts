import { FlatCache } from "flat-cache";

const cache = new FlatCache({ ttl: 24 * 60 * 60, cacheDir: "../../.data/" });

export default {
  get: <T>(key: string) => cache.get(key) as T,
  set: <T>(key: string, value: T) => cache.set(key, value),
};
