import type { Runner } from "@cronny/types";
import { cached } from "../utils/cache.js";
import { geocode } from "../utils/coordinates.js";
import { createLogger } from "../utils/logger.js";
import { BaseImmoParams, BaseImmoResult, filterResults } from "./immo.base.js";

const logger = createLogger("olx");

interface OlxApiResponse {
  data?: Array<{
    id: number;
    title: string;
    display_price: string;
    category_id: number;
    available: boolean;
    status: string;
    sponsored: number;
    labels?: string[];
    image?: string;
    city_id?: number;
    location?: {
      lat: number;
      lon: number;
    };
    special_labels?: Array<{
      value: string | number;
      label: string;
      unit: string | null;
    }>;
  }>;
  meta?: {
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
  };
}

export const run: Runner<BaseImmoParams, BaseImmoResult> = (params) => {
  if (!params) {
    throw new Error("Missing params");
  }

  return fetchOlxImmoSearch(params);
};

async function fetchOlxImmoSearch({
  url,
  filters,
}: BaseImmoParams): Promise<BaseImmoResult[]> {
  try {
    const apiUrl = convertOlxUrlToApiUrl(url);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OLX API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OlxApiResponse;

    if (!data.data || data.data.length === 0) {
      logger.info("No results found from OLX API");
      return [];
    }

    logger.info(`Found ${data.data.length} results from OLX API`);

    const results = await addGeoLocation(data.data.map(toImmoResult));

    return filterResults(results, filters);
  } catch (error) {
    logger.error("Error fetching OLX results:", error);
    throw error;
  }
}

function convertOlxUrlToApiUrl(olxWebUrl: string): string {
  try {
    const inputUrl = new URL(olxWebUrl);
    const apiUrl = new URL("https://api.olx.ba/search");

    apiUrl.searchParams.set("category_id", "2");

    for (const [key, value] of inputUrl.searchParams) {
      apiUrl.searchParams.set(key, value);
    }

    if (!apiUrl.searchParams.get("q") && inputUrl.pathname) {
      const pathParts = inputUrl.pathname
        .split("/")
        .filter((part) => part.length > 0);
      const searchTerms = pathParts.filter(
        (part) =>
          ![
            "pretraga",
            "search",
            "oglasi",
            "ads",
            "nekretnine",
            "real-estate",
          ].includes(part.toLowerCase()) && isNaN(Number(part))
      );

      if (searchTerms.length > 0) {
        const query = searchTerms
          .map((term) => decodeURIComponent(term))
          .join(" ");
        apiUrl.searchParams.set("q", query);
      }
    }

    logger.info(
      `Converted OLX URL: ${olxWebUrl} -> API URL: ${apiUrl.toString()}`
    );

    return apiUrl.toString();
  } catch (error) {
    logger.error("Error parsing OLX URL:", error);
    return "https://api.olx.ba/search?category_id=2";
  }
}

async function addGeoLocation(
  results: BaseImmoResult[]
): Promise<BaseImmoResult[]> {
  const resultsWithCoords = [];
  for (const result of results) {
    if (result.address && !result.coordinates) {
      result.coordinates = await cached(geocode)(result.address);
    }
    resultsWithCoords.push(result);
  }

  return resultsWithCoords;
}

function toImmoResult(
  item: NonNullable<OlxApiResponse["data"]>[0]
): BaseImmoResult {
  const roomsLabel = item.special_labels?.find(
    (label) =>
      label.label.toLowerCase().includes("soba") ||
      label.label.toLowerCase().includes("room")
  );
  const rooms = roomsLabel ? Number(roomsLabel.value) || 0 : 0;

  const sizeLabel = item.special_labels?.find(
    (label) =>
      label.unit === "m²" ||
      label.unit === "㎡" ||
      label.label.toLowerCase().includes("površina") ||
      label.label.toLowerCase().includes("kvadrata") ||
      label.label.toLowerCase().includes("area")
  );
  const size = sizeLabel ? Number(sizeLabel.value) || 0 : 0;

  const priceMatch = item.display_price?.match(/[\d.,]+/);
  const price = priceMatch
    ? Number(priceMatch[0].replace(/[.,]/g, (m) => (m === "," ? "." : "")))
    : 0;

  const address = item.city_id
    ? `City ID: ${item.city_id}`
    : "Unknown location";

  return {
    id: item.id.toString(),
    title: item.title,
    price,
    address,
    rooms,
    coordinates: item.location ? [item.location.lat, item.location.lon] : null,
    size,
    url: `https://www.olx.ba/artikal/${item.id}`,
  };
}
