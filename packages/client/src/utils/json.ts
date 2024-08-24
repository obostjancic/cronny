export const formatJSON = (json: Record<string, unknown>): string =>
  JSON.stringify(json, null, 2);
