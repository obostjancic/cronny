import { isWithinRadius, parseCoordinates } from "../utils/coordinates.js";
import { run as fetchWillhabenResults } from "./willhaben.js";

type WillhabenImmoParams = {
  url: string;
  center: [number, number];
  radius: number;
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
  center,
  radius,
}: WillhabenImmoParams) {
  const genericResults = await fetchWillhabenResults({ url });

  const flatResults: WillhabenImmoResult[] = genericResults.map((result) => {
    return {
      id: result.id,
      title: `${result.HEADING}`,
      price: Number(result.PRICE),
      address: `${result.ADDRESS}`,
      floor: Number(result.FLOOR),
      rooms: Number(result.NUMBER_OF_ROOMS),
      coords: `${result.COORDINATES}`,
      url: `https://www.willhaben.at/iad/object?adId=${result.id}`,
    };
  });

  return flatResults.filter((result) => {
    if (!center || !result.coords || typeof result.coords !== "string") {
      return false;
    }

    const parsedCoords = parseCoordinates(result.coords);
    if (!parsedCoords) {
      return false;
    }

    return isWithinRadius(center, radius, parsedCoords);
  });
}
