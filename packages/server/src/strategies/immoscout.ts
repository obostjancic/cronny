import axios from "axios";
import { createLogger } from "../utils/logger.js";
import { Coordinates, Runner } from "@cronny/types";
import { filterResults, BaseImmoResult } from "./immo.base.js";
// fetch list with
// https://www.immobilienscout24.at/portal/graphql?operationName=findPropertiesByParams&variables=%7B%22aspectRatio%22%3A1.77%2C%22params%22%3A%7B%22countryCode%22%3A%22AT%22%2C%22estateType%22%3A%22APARTMENT%22%2C%22from%22%3A%2215%22%2C%22size%22%3A%2210%22%2C%22transferType%22%3A%22RENT%22%2C%22useType%22%3A%22RESIDENTIAL%22%2C%22zipCode%22%3A%221200%22%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22sha256Hash%22%3A%221a73f5536e8aad220c24f1b4ce4f7654e3d7a1d932e85134f9efc1777f34f4ce%22%2C%22version%22%3A1%7D%7D

// response contains "exposeID"
// use that to query https://www.immobilienscout24.at/expose/graphql

const logger = createLogger("immoscout");

type ImmoscoutParams = {
  url: string;
  // TODO: typing
} & { filters?: any[] };

export interface ImmoscoutResult {
  displayType: string;
  accountCwid: string;
  addressString: string;
  badges: LabelValue[];
  exposeId: string;
  hasRealtorLogo: boolean;
  hasBrandBar: boolean;
  isEditorialProperty: boolean;
  isPrivate: boolean;
  isSocialHousing: boolean;
  primaryPrice: number;
  primaryArea: number;
  numberOfRooms: number;
  headline: string;
  imageBadges: any[];
  links: Links;
  mainKeyFacts: LabelValue[];
  dateCreated: Date;
  primaryPriceKeyFact: LabelValue;
  pricePerSqmKeyFact: LabelValue;
  priceReductionKeyFact: null;
  editorialPropertyUrl: null;
  geoHierarchy: string[];
  coordinates: Coordinates;
}

export interface LabelValue {
  label: null | string;
  value: string;
}

export interface Links {
  targetURL: string;
  absoluteURL: string;
}

export const run: Runner<ImmoscoutParams, BaseImmoResult> = async (params) => {
  if (!params) {
    throw new Error("Missing params");
  }

  const rawResults = await fetchImmoscoutSearch(params);

  if (!rawResults) {
    return [];
  }

  const transformedResults = rawResults.map(toImmoResult);
  logger.debug(`Found ${transformedResults.length} results`);

  const results = filterResults(transformedResults, params.filters);
  logger.debug(`Filtered to ${results.length} results`);

  return transformedResults.map((result) => ({
    ...result,
    status: !results.includes(result) ? "filtered" : "active",
  }));
};

export async function fetchImmoscoutSearch({ url }: ImmoscoutParams) {
  const { data } = await axios.get(url);

  const results = data.data.findPropertiesByParams.hits;

  const resultsWithCoords = [];
  for (const result of results) {
    const coordinates = await fetchImmoscoutCoordinates(result.exposeId);
    resultsWithCoords.push({ ...result, coordinates });
  }

  return resultsWithCoords;
}

async function fetchImmoscoutCoordinates(
  exposeId: string
): Promise<Coordinates> {
  const { data } = await axios.post(
    "https://www.immobilienscout24.at/expose/graphql",
    {
      operationName: "location",
      variables: {
        exposeId: exposeId,
      },
      query:
        "query location($exposeId: ID!) {\n  location(exposeId: $exposeId) {\n    description\n    address\n    isCompleteAddress\n    map {\n      center {\n        lat\n        lng\n      }\n      point {\n        lat\n        lng\n      }\n      polygon {\n        lat\n        lng\n      }\n    }\n  }\n}",
    }
  );

  return [data.data.location.map.center.lat, data.data.location.map.center.lng];
}

function toImmoResult(result: ImmoscoutResult): BaseImmoResult {
  return {
    id: result.exposeId,
    title: result.headline,
    price: result.primaryPrice,
    address: result.addressString,
    rooms: result.numberOfRooms,
    coordinates: result.coordinates,
    size: result.primaryArea,
    url: result.links.absoluteURL,
  };
}
