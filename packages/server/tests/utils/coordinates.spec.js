import { describe, it, expect } from "vitest";
import {
  parseCoordinates,
  distance,
  isWithinRadius,
  isWithinPolygon,
} from "../../src/utils/coordinates";

describe("parseCoordinates", () => {
  it("should parse valid coordinates", () => {
    expect(parseCoordinates("40.7128,-74.0060")).toEqual([40.7128, -74.006]);
  });

  it("should return null for invalid coordinates", () => {
    expect(parseCoordinates(null)).toBeNull();
  });
});

describe("distance", () => {
  it("should calculate the correct distance between two points", () => {
    const coord1 = [40.7128, -74.006];
    const coord2 = [34.0522, -118.2437];
    expect(distance(coord1, coord2)).toBeCloseTo(3936, 0);
  });
});

describe("isWithinRadius", () => {
  it("should return true if the target is within the radius", () => {
    const center = [40.7128, -74.006];
    const target = [40.73061, -73.935242];
    const radius = 10; // in km
    expect(isWithinRadius(center, radius, target)).toBe(true);
  });

  it("should return false if the target is outside the radius", () => {
    const center = [40.7128, -74.006];
    const target = [34.0522, -118.2437];
    const radius = 10; // in km
    expect(isWithinRadius(center, radius, target)).toBe(false);
  });
});

describe("isWithinPolygon", () => {
  it("should return true if the target is within the polygon", () => {
    const polygon = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
    ];
    const target = [5, 5];
    expect(isWithinPolygon(polygon, target)).toBe(true);
  });

  it("should return false if the target is outside the polygon", () => {
    const polygon = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
    ];
    const target = [15, 5];
    expect(isWithinPolygon(polygon, target)).toBe(false);
  });
});
