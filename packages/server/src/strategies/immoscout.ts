import { Coordinates, Runner } from "@cronny/types";
import axios from "axios";
import { BaseImmoParams, BaseImmoResult, filterResults } from "./immo.base.js";

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
  imageBadges: unknown[];
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

export const run: Runner<BaseImmoParams, BaseImmoResult> = async (params) => {
  if (!params) {
    throw new Error("Missing params");
  }

  const rawResults = await fetchImmoscoutSearch(params);

  if (!rawResults) {
    return [];
  }

  const results = rawResults.map(toImmoResult);

  return filterResults(results, params.filters);
};

interface ImmoscoutSearchResponse {
  data: {
    findPropertiesByParams: {
      hits: ImmoscoutResult[];
    };
  };
}

interface ImmoscoutLocationResponse {
  data: {
    location: {
      map: {
        center: {
          lat: number;
          lng: number;
        };
      };
    };
  };
}

export async function fetchImmoscoutSearch({ url }: BaseImmoParams) {
  const { data } = await axios.get<ImmoscoutSearchResponse>(url);

  const results = data.data.findPropertiesByParams.hits;

  const resultsWithCoords = [];
  for (const result of results) {
    if (result.coordinates) {
      resultsWithCoords.push(result);
      continue;
    }
    const coordinates = await fetchImmoscoutCoordinates(result.exposeId);
    resultsWithCoords.push({ ...result, coordinates });
  }

  return resultsWithCoords;
}

async function fetchImmoscoutCoordinates(
  exposeId: string
): Promise<Coordinates> {
  const { data } = await axios.post<ImmoscoutLocationResponse>(
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
