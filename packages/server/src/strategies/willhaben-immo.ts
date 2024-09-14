import type { Runner } from "@cronny/types";
import { parseCoordinates } from "../utils/coordinates.js";
import { createLogger } from "../utils/logger.js";
import { filterResults, BaseImmoParams, BaseImmoResult } from "./immo.base.js";
import { run as fetchWillhabenResults, WillhabenResult } from "./willhaben.js";

const logger = createLogger("willhaben-immo");

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

  const transformedResults: BaseImmoResult[] = rawResults.map(toImmoResult);
  logger.debug(`Found ${transformedResults.length} results`);

  const results = filterResults(transformedResults, filters);

  logger.debug(`Filtered to ${results.length} results`);

  return transformedResults.map((result) => ({
    ...result,
    status: !results.includes(result) ? "filtered" : "active",
  }));
}

function toImmoResult(
  result: WillhabenResult | WillhabenImmoResult
): BaseImmoResult {
  const size = result["ESTATE_SIZE/LIVING_AREA"] || result["ESTATE_SIZE"];
  return {
    id: result.id,
    title: `${result.HEADING}`,
    price: Number(result.PRICE),
    address: `${result.ADDRESS}`,
    rooms: Number(result.NUMBER_OF_ROOMS),
    coordinates: parseCoordinates(result.COORDINATES),
    size: Number(size),
    url: `https://www.willhaben.at/iad/object?adId=${result.id}`,
  };
}
