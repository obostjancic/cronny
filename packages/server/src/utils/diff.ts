import type { JSONObject } from "@cronny/types";

export function diff(a: JSONObject[], b: JSONObject[]) {
  const aIds = a.map((x) => x.id);
  const bIds = b.map((x) => x.id);

  const added = b.filter((x) => !aIds.includes(x.id));
  const removed = a.filter((x) => !bIds.includes(x.id));

  return { added, removed };
}
