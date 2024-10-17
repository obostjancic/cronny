export const sanitizeAddress = (address: string): string => {
  const withoutSlashes = address.split("/")[0];

  return withoutSlashes
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue");
};
