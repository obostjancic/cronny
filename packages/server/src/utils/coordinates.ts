import { Coordinates } from "@cronny/types";
import axios from "axios";
import { sanitizeAddress } from "./address.js";
import cache from "./cache.js";
import { getEnv } from "./env.js";
import { retry } from "./request.js";

export function parseCoordinates(coordinates: string): Coordinates | null {
  try {
    const [latitude, longitude] = coordinates.split(",").map(Number);
    return [latitude, longitude];
  } catch (e) {
    return null;
  }
}

export function distance(
  [lat1, lon1]: Coordinates,
  [lat2, lon2]: Coordinates
): number {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export function isWithinRadius(
  center: Coordinates,
  radius: number,
  target: Coordinates
): boolean {
  return distance(center, target) <= radius;
}

export function isWithinPolygon(
  polygon: Coordinates[],
  target: Coordinates
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > target[1] !== yj > target[1] &&
      target[0] < ((xj - xi) * (target[1] - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

export async function geocode(address: string): Promise<Coordinates | null> {
  const sanitized = sanitizeAddress(address);

  if (cache.get(sanitized)) {
    return cache.get<Coordinates | null>(sanitized);
  }

  try {
    const apiKey = getEnv("GEOCODE_API_KEY");
    const response = await retry(
      () =>
        axios.get("https://geocode.maps.co/search", {
          params: {
            api_key: apiKey,
            q: sanitized,
          },
        }),
      {
        retries: 5,
      }
    );

    const match = response.data[0];

    if (!match) {
      cache.set(sanitized, null);
      return null;
    }

    const coordinates = parseCoordinates(`${match.lat},${match.lon}`);

    cache.set(sanitized, coordinates);

    return coordinates;
  } catch (e) {
    cache.set(sanitized, null);
    return null;
  }
}
