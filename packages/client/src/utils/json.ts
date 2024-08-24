export const formatJSON = (json?: unknown): string => {
  if (!json) {
    return "";
  }

  return JSON.stringify(json, null, 2);
};
