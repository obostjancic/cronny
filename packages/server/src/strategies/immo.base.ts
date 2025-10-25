import { Coordinates } from "@cronny/types";
import { isWithinPolygon, isWithinRadius } from "../utils/coordinates.js";
import { Filter, matchDataFilter } from "../utils/filter.js";
import logger from "../utils/logger.js";

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

export type BaseImmoParams = {
  url: string;
} & { filters?: Filter<BaseImmoResult>[] };

export type BaseImmoResult = {
  id: string;
  title: string;
  price: number;
  address: string;
  rooms: number;
  coordinates: Coordinates | null;
  size: number;
  url: string;
};

export function filterResults(
  results: BaseImmoResult[],
  filters?: Filter<BaseImmoResult>[],
) {
  const filtered = matchFilters(results, filters);

  logger.debug(
    `Found ${results.length} results, filtered to ${filtered.length}`,
  );
  return results.map((result) => ({
    ...result,
    status: !filtered.includes(result) ? "filtered" : "active",
  }));
}

function matchFilters(
  results: BaseImmoResult[],
  filters?: Filter<BaseImmoResult>[],
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

function matchFilter(
  result: BaseImmoResult,
  filter: Filter<BaseImmoResult>,
): boolean {
  if (filter.prop === "coordinates") {
    return matchCoordsFilter(result, filter as CoordinatesFilter);
  }

  return matchDataFilter(result, filter);
}

function matchCoordsFilter(
  result: BaseImmoResult,
  coordinatesFilter: CoordinatesFilter,
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
