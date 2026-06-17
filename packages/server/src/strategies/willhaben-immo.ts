import type { Runner } from "@cronny/types";
import { geocode, parseCoordinates } from "../utils/coordinates.js";
import { BaseImmoParams, BaseImmoResult, filterResults } from "./immo.base.js";
import { run as fetchWillhabenResults, WillhabenResult } from "./willhaben.js";
import { cached } from "../utils/cache.js";

type WillhabenImmoResult = WillhabenResult & {
  ADDRESS: string;
  LOCATION: string;
  POSTCODE: string;
  STATE: string;
  ORGNAME: string;
  "ESTATE_SIZE/LIVING_AREA": string;
  DISTRICT: string;
  HEADING: string;
  FLOOR: string;
  PUBLISHED: string;
  LOCATION_ID: string;
  PROPERTY_TYPE: string;
  NUMBER_OF_ROOMS: string;
  ADID: string;
  ORGID: string;
  "RENT/PER_MONTH_LETTINGS": string;
  PRODUCT_ID: string;
  ROOMS: string;
  COORDINATES: string;
  PRICE: string;
  PRICE_FOR_DISPLAY: string;
  ESTATE_SIZE: string;
  ISPRIVATE: string;
  PROPERTY_TYPE_FLAT: string;
  UNIT_TITLE: string;
};

export const run: Runner<BaseImmoParams, BaseImmoResult> = (params) => {
  if (!params) {
    throw new Error("Missing params");
  }

  return fetchWillhabenImmoSearch(params!);
};

async function fetchWillhabenImmoSearch({ url, filters }: BaseImmoParams) {
  const rawResults = await fetchWillhabenResults({ url });

  if (!rawResults) {
    return [];
  }

  const results = await addGeoLocation(rawResults.map(toImmoResult));

  return filterResults(results, filters);
}

async function addGeoLocation(
  results: BaseImmoResult[]
): Promise<BaseImmoResult[]> {
  const cachedGeocode = cached(geocode);
  return Promise.all(
    results.map(async (result) => {
      if (result.address && !result.coordinates) {
        result.coordinates = await cachedGeocode(result.address);
      }
      return result;
    })
  );
}

function toImmoResult(
  result: WillhabenResult | WillhabenImmoResult
): BaseImmoResult {
  const size = result["ESTATE_SIZE/LIVING_AREA"] || result["ESTATE_SIZE"];

  return {
    id: result.id,
    title: getAttributeText(result, "HEADING"),
    price: Number(getAttributeText(result, "PRICE")),
    address: getAttributeText(result, "ADDRESS"),
    rooms: Number(getAttributeText(result, "NUMBER_OF_ROOMS")),
    coordinates: parseCoordinates(getAttributeText(result, "COORDINATES")),
    size: Number(size),
    url: `https://www.willhaben.at/iad/object?adId=${result.id}`,
  };
}

function getAttributeText(result: WillhabenResult, key: string): string {
  return `${result[key]}`;
}
