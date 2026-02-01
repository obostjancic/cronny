import type { JSONValue } from "@cronny/types";

export type Filter<T> = {
  prop: keyof T;
  value?: JSONValue;
  min?: number;
  max?: number;
  negate?: boolean;
};

export function matchDataFilter<T>(result: T, filter: Filter<T>): boolean {
  const rawValue = result[filter.prop];

  // Handle range filters (min/max)
  if (filter.min !== undefined || filter.max !== undefined) {
    const numValue = typeof rawValue === "number" ? rawValue : Number(rawValue);
    if (isNaN(numValue)) {
      return false;
    }
    if (filter.min !== undefined && numValue < filter.min) {
      return false;
    }
    if (filter.max !== undefined && numValue > filter.max) {
      return false;
    }
    return true;
  }

  // Handle exact/wildcard value matching
  const lhs = `${rawValue}`.trim().toLowerCase();
  let rhs = filter.value;

  if (!rhs) {
    return true;
  }

  if (Array.isArray(rhs)) {
    return rhs.some((r) => matchDataFilter(result, { ...filter, value: r }));
  }

  rhs = `${rhs}`.toString().trim().toLowerCase();

  if (rhs.startsWith("%") && rhs.endsWith("%")) {
    return lhs.includes(rhs.slice(1, -1));
  }
  if (rhs.startsWith("%")) {
    return lhs.endsWith(rhs.slice(1));
  }
  if (rhs.endsWith("%")) {
    return lhs.startsWith(rhs.slice(0, -1));
  }

  return lhs === rhs;
}
