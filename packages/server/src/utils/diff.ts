import type { JSONObject } from "@cronny/types";

export function arrayDiff(a: JSONObject[], b: JSONObject[]) {
  const aIds = a.map((x) => x.id);
  const bIds = b.map((x) => x.id);

  const added = b.filter((x) => !aIds.includes(x.id));
  const removed = a.filter((x) => !bIds.includes(x.id));

  return { added, removed };
}

export function objectDiff(a: JSONObject, b: JSONObject) {
  const added = Object.keys(b).filter((key) => !a[key]);
  const removed = Object.keys(a).filter((key) => !b[key]);
  const changed = Object.keys(a).filter(
    (key) => a[key] && b[key] && a[key] !== b[key]
  );

  return { added, removed, changed };
}

export function equal(a?: JSONObject, b?: JSONObject) {
  if (!a && !b) {
    return true;
  }

  try {
    const aSorted = Object.keys(a!)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: a![key] }), {});
    const bSorted = Object.keys(b!)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: b![key] }), {});

    return JSON.stringify(aSorted) === JSON.stringify(bSorted);
  } catch {
    return false;
  }
}
