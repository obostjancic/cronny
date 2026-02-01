export interface ParsedGeoData {
  type: "polygon" | "radius";
  polygon?: [number, number][];
  center?: [number, number];
  radius?: number;
}

export interface ExtractedFilters {
  priceMin?: number;
  priceMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  roomsMin?: number;
  roomsMax?: number;
}

export interface ParsedUrlData {
  geo?: ParsedGeoData;
  cleanedUrl: string;
  extractedParams: string[];
  extractedFilters?: ExtractedFilters;
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
    const extractedFilters: ExtractedFilters = {};

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

    // Extract filter values before removing them
    const priceFrom = params.get("price_from");
    const priceTo = params.get("price_to");
    const sizeFrom = params.get("size_from");
    const sizeTo = params.get("size_to");
    const roomsFrom = params.get("rooms_from");
    const roomsTo = params.get("rooms_to");

    if (priceFrom) {
      const val = Number(priceFrom);
      if (!isNaN(val)) extractedFilters.priceMin = val;
    }
    if (priceTo) {
      const val = Number(priceTo);
      if (!isNaN(val)) extractedFilters.priceMax = val;
    }
    if (sizeFrom) {
      const val = Number(sizeFrom);
      if (!isNaN(val)) extractedFilters.sizeMin = val;
    }
    if (sizeTo) {
      const val = Number(sizeTo);
      if (!isNaN(val)) extractedFilters.sizeMax = val;
    }
    if (roomsFrom) {
      const val = Number(roomsFrom);
      if (!isNaN(val)) extractedFilters.roomsMin = val;
    }
    if (roomsTo) {
      const val = Number(roomsTo);
      if (!isNaN(val)) extractedFilters.roomsMax = val;
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

    const hasFilters = Object.keys(extractedFilters).length > 0;
    return { geo, cleanedUrl, extractedParams, extractedFilters: hasFilters ? extractedFilters : undefined };
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
