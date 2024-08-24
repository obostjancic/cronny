type Coordinates = [number, number];

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
