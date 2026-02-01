export interface ParsedGeoData {
  type: "polygon" | "radius";
  polygon?: [number, number][];
  center?: [number, number];
  radius?: number;
}

export interface ParsedUrlData {
  geo?: ParsedGeoData;
  cleanedUrl: string;
  extractedParams: string[];
}

// Parameters that should be stripped from URLs after extraction
const GEO_PARAMS = ["location_br", "location_tl", "location", "lat", "lng", "radius"];
const FILTER_PARAMS = ["price_from", "price_to", "size_from", "size_to", "rooms_from", "rooms_to"];
const ALL_EXTRACTABLE_PARAMS = [...GEO_PARAMS, ...FILTER_PARAMS];

export function parseAndCleanUrl(url: string): ParsedUrlData | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    const extractedParams: string[] = [];
    let geo: ParsedGeoData | undefined;

    // OLX.ba format: location_br and location_tl define a bounding box
    const locationBr = params.get("location_br");
    const locationTl = params.get("location_tl");

    if (locationBr && locationTl) {
      const [brLat, brLng] = locationBr.split(",").map(Number);
      const [tlLat, tlLng] = locationTl.split(",").map(Number);

      if (!isNaN(brLat) && !isNaN(brLng) && !isNaN(tlLat) && !isNaN(tlLng)) {
        const polygon: [number, number][] = [
          [tlLat, tlLng],
          [tlLat, brLng],
          [brLat, brLng],
          [brLat, tlLng],
        ];
        geo = { type: "polygon", polygon };
        extractedParams.push("location_br", "location_tl");
      }
    }

    // Remove extracted params from URL
    for (const param of ALL_EXTRACTABLE_PARAMS) {
      if (params.has(param)) {
        params.delete(param);
        if (!extractedParams.includes(param)) {
          extractedParams.push(param);
        }
      }
    }

    // Build cleaned URL
    const cleanedUrl = urlObj.origin + urlObj.pathname +
      (params.toString() ? "?" + params.toString() : "");

    return { geo, cleanedUrl, extractedParams };
  } catch {
    return null;
  }
}

// Legacy function for backward compatibility
export function parseGeoFromUrl(url: string): ParsedGeoData | null {
  const result = parseAndCleanUrl(url);
  return result?.geo ?? null;
}

export function getUrlDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}
