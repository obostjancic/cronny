import {
  isWithinPolygon,
  isWithinRadius,
  parseCoordinates,
} from "../utils/coordinates.js";
import { run as fetchWillhabenResults } from "./willhaben.js";
import { createLogger } from "../utils/logger.js";
import { JSONValue } from "@cronny/types";
import { fi } from "date-fns/locale";

const logger = createLogger("willhaben-immo");

type LocationParams =
  | {
      center: [number, number];
      radius: number;
    }
  | {
      points: [number, number][];
    };

// allows filtering by a prop of the result, and negation
type DataFilter = {
  prop: keyof WillhabenImmoResult;
  value: JSONValue;
  negate?: boolean;
};

type WillhabenImmoParams = {
  url: string;
} & LocationParams & { filters?: DataFilter[] };

type WillhabenImmoResult = {
  id: string;
  title: string;
  price: number;
  address: string;
  floor: number;
  rooms: number;
  coords: string;
  url: string;
};

export async function run(params: WillhabenImmoParams) {
  return await fetchWillhabenImmoSearch(params);
}

async function fetchWillhabenImmoSearch({
  url,
  filters,
  ...locationParams
}: WillhabenImmoParams) {
  const genericResults = await fetchWillhabenResults({ url });

  const flatResults: WillhabenImmoResult[] = genericResults.map((result) => {
    const size = result["ESTATE_SIZE/LIVING_AREA"] || result["ESTATE_SIZE"];
    return {
      id: result.id,
      title: `${result.HEADING}`,
      price: Number(result.PRICE),
      address: `${result.ADDRESS}`,
      floor: Number(result.FLOOR),
      rooms: Number(result.NUMBER_OF_ROOMS),
      coords: `${result.COORDINATES}`,
      size: Number(size),
      url: `https://www.willhaben.at/iad/object?adId=${result.id}`,
    };
  });
  logger.debug(`Found ${flatResults.length} results`);

  const filtered = flatResults
    .filter((result) => isWithinArea(result, locationParams))

    .filter((result) => {
      if (!filters) {
        return true;
      }
      return filters.every((filter) => {
        if (Array.isArray(filter.value)) {
          const isMatch = filter.value.includes(result[filter.prop]);
          return filter.negate ? !isMatch : isMatch;
        }
        const isMatch = result[filter.prop] === filter.value;
        return filter.negate ? !isMatch : isMatch;
      });
    });

  logger.debug(`Filtered to ${filtered.length} results`);
  return filtered;
}

function isWithinArea(
  result: WillhabenImmoResult,
  locationParams: LocationParams
) {
  if (!locationParams) {
    return true;
  }

  if (!result.coords || typeof result.coords !== "string") {
    return false;
  }

  const parsedCoords = parseCoordinates(result.coords);
  if (!parsedCoords) {
    return false;
  }
  if ("radius" in locationParams) {
    const { center, radius } = locationParams;
    return isWithinRadius(center, radius, parsedCoords);
  } else {
    return isWithinPolygon(locationParams.points, parsedCoords);
  }
}
