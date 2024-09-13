import { Coordinates, JSONValue } from "@cronny/types";
import { isWithinPolygon, isWithinRadius } from "../utils/coordinates.js";
import { Filter, matchDataFilter } from "../utils/filter.js";

export type CoordinatesFilter = {
  prop: "coordinates";
  value:
    | {
        center: [number, number];
        radius: number;
      }
    | {
        points: [number, number][];
      };
  negate?: boolean;
};

export type ImmoParams = {
  url: string;
} & { filters?: Filter<ImmoResult>[] };

export type ImmoResult = {
  id: string;
  title: string;
  price: number;
  address: string;
  floor: number;
  rooms: number;
  coordinates: Coordinates | null;
  size: number;
  url: string;
};

export function filterResults(
  results: ImmoResult[],
  filters?: Filter<ImmoResult>[]
) {
  if (!filters) {
    return results;
  }

  return results.filter((result) => {
    return filters.every((filter) => {
      const isMatch = matchFilter(result, filter);
      return filter.negate ? !isMatch : isMatch;
    });
  });
}

function matchFilter(result: ImmoResult, filter: Filter<ImmoResult>): boolean {
  if (filter.prop === "coordinates") {
    return matchCoordsFilter(result, filter as CoordinatesFilter);
  }

  return matchDataFilter(result, filter);
}

function matchCoordsFilter(
  result: ImmoResult,
  coordinatesFilter: CoordinatesFilter
) {
  if (!result.coordinates) {
    return false;
  }

  if ("radius" in coordinatesFilter.value) {
    const { center, radius } = coordinatesFilter.value;
    return isWithinRadius(center, radius, result.coordinates);
  } else {
    return isWithinPolygon(coordinatesFilter.value.points, result.coordinates);
  }
}
