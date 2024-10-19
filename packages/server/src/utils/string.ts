export const sanitize = (str: unknown | undefined | null): string => {
  if (str === undefined || str === null) {
    return "";
  }

  return String(str)
    .trim()
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\n/g, "")
    .replaceAll(/\t/g, "")
    .replaceAll(/\r/g, "")
    .trim();
};
