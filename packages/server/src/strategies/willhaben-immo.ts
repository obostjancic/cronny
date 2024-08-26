import {
  isWithinPolygon,
  isWithinRadius,
  parseCoordinates,
} from "../utils/coordinates.js";
import { run as fetchWillhabenResults } from "./willhaben.js";

type WillhabenImmoParams =
  | {
      url: string;
      center: [number, number];
      radius: number;
    }
  | {
      url: string;
      points: [number, number][];
    };

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
  ...coordParams
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

  return flatResults.filter((result) => {
    if (!result.coords || typeof result.coords !== "string") {
      return false;
    }

    const parsedCoords = parseCoordinates(result.coords);
    if (!parsedCoords) {
      return false;
    }
    if ("radius" in coordParams) {
      const { center, radius } = coordParams;
      return isWithinRadius(center, radius, parsedCoords);
    } else {
      return isWithinPolygon(coordParams.points, parsedCoords);
    }
  });
}
