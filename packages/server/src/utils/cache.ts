import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 1000, checkperiod: 120 });

export default {
  get: <T>(key: string) => cache.get(key) as T,
  set: <T>(key: string, value: T) => cache.set(key, value),
};
