import type { JSONObject, JSONValue } from "@cronny/types";

const DEFAULT_MODEL_SLUG = "poolside/laguna-xs.2:free";
const MODEL_PARAM_KEYS = new Set(["model", "fallbackModel"]);
const MODEL_SLUG_PATTERN = /([a-z0-9-]+\/[a-z0-9][a-z0-9._-]*(?::[a-z0-9._-]+)?)/i;

export function normalizeModelSlug(model?: string): string {
  const normalized = model?.trim();

  if (!normalized) {
    return DEFAULT_MODEL_SLUG;
  }

  const extractedSlug = extractModelSlug(normalized);
  if (extractedSlug) {
    return extractedSlug;
  }

  return normalized;
}

export function normalizeJobParams<T extends JSONObject | null>(params: T): T {
  if (!params) {
    return params;
  }

  return normalizeObject(params) as T;
}

function normalizeObject(value: JSONObject): JSONObject {
  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => {
      if (MODEL_PARAM_KEYS.has(key) && typeof entryValue === "string") {
        return [key, normalizeModelSlug(entryValue)];
      }

      return [key, normalizeJsonValue(entryValue)];
    })
  );
}

function normalizeJsonValue(value: JSONValue): JSONValue {
  if (Array.isArray(value)) {
    return value.map(normalizeJsonValue);
  }

  if (isJSONObject(value)) {
    return normalizeObject(value);
  }

  return value;
}

function extractModelSlug(value: string): string | undefined {
  const match = value.match(MODEL_SLUG_PATTERN);
  return match?.[1];
}

function isJSONObject(value: JSONValue): value is JSONObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
