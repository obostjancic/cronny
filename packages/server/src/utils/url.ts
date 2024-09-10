export function parseURLParams(url: string) {
  const search = url.split("?")[1];
  if (!search) {
    return {};
  }
  return search.split("&").reduce(
    (acc, pair) => {
      const [key, value] = pair.split("=");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );
}

export function replaceURLParams(
  url: string,
  params: Record<string, string | number>
): string {
  const existingParams = parseURLParams(url);

  const search = Object.entries({ ...existingParams, ...params })
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${url.split("?")[0]}?${search}`;
}
