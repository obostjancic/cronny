export interface ParsedGeoData {
  type: "polygon" | "radius";
  polygon?: [number, number][];
  center?: [number, number];
  radius?: number;
}

export function parseGeoFromUrl(url: string): ParsedGeoData | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // OLX.ba format: location_br and location_tl define a bounding box
    const locationBr = params.get("location_br");
    const locationTl = params.get("location_tl");

    if (locationBr && locationTl) {
      const [brLat, brLng] = locationBr.split(",").map(Number);
      const [tlLat, tlLng] = locationTl.split(",").map(Number);

      if (!isNaN(brLat) && !isNaN(brLng) && !isNaN(tlLat) && !isNaN(tlLng)) {
        // Create polygon from bounding box (4 corners)
        const polygon: [number, number][] = [
          [tlLat, tlLng], // top-left
          [tlLat, brLng], // top-right
          [brLat, brLng], // bottom-right
          [brLat, tlLng], // bottom-left
        ];

        return { type: "polygon", polygon };
      }
    }

    // Willhaben format: could have different params
    // Add more parsers as needed

    // ImmoScout format: could have different params
    // Add more parsers as needed

    return null;
  } catch {
    return null;
  }
}

export function getUrlDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}
