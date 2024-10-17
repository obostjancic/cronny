import { createLogger } from "../utils/logger.js";
import { Coordinates, Runner } from "@cronny/types";
import { BaseImmoParams, BaseImmoResult } from "./immo.base.js";
import axios from "axios";
import { parse } from "node-html-parser";
import { geocode } from "../utils/coordinates.js";
import { fetchMultiplePages } from "../utils/request.js";
import { replaceURLParams } from "../utils/url.js";

const MAX_ROWS = 15;
const MAX_PAGES = 5;

const logger = createLogger("standard");

type RawStandardResult = {
  id: number;
  title: string | undefined;
  price: string | undefined;
  url: string | undefined;
  address: string | undefined;
  size: string | undefined;
  rooms: string | undefined;
  coordinates: Coordinates | null;
};

export const run: Runner<BaseImmoParams, BaseImmoResult> = (params) => {
  if (!params) {
    throw new Error("Missing params");
  }

  return fetchStandardImmoSearch(params!);
};

async function fetchStandardImmoSearch({ url, filters }: BaseImmoParams) {
  const rawResults = await fetchResults({ url });
  console.log(rawResults.length);
  if (!rawResults) {
    return [];
  }

  const transformedResults: BaseImmoResult[] = rawResults.map(toImmoResult);

  const results = filterResults(transformedResults, filters);

  logger.debug(
    `Found ${transformedResults.length} results, filtered to ${results.length}`
  );
  return transformedResults.map((result) => ({
    ...result,
  }));
}

async function fetchResults({
  url,
}: BaseImmoParams): Promise<RawStandardResult[]> {
  return fetchMultiplePages(url, fetchResultPage, MAX_ROWS, MAX_PAGES);
}

async function fetchResultPage(url: string, page = 1) {
  const urlWithPage = replaceURLParams(url, { page });
  const response = await axios.get(urlWithPage);
  const html = response.data as string;

  const items = parse(html).querySelectorAll(".sc-listing-card-content");

  return Promise.all(
    items.map(async (item) => {
      const id = Number(item?.getAttribute("href")?.match(/\d+/g)?.[0]);

      const address =
        item.querySelector(
          "div.sc-listing-card-body-main-content > div:first-child > div"
        )?.text ?? "Wien";

      const coordinates = await geocode(address);

      return {
        id: id,
        title: item.querySelector(
          "div.sc-listing-card-body-main-content > div > div.sc-listing-card-title-no-margin"
        )?.text,
        price: item.querySelector(
          "div.sc-listing-card-footer.sc-listing-card-footer-default > div:nth-child(1)"
        )?.text,
        address,
        size: item.querySelector(
          "div.sc-listing-card-footer.sc-listing-card-footer-default > div:nth-child(2)"
        )?.text,
        rooms: item.querySelector(
          "div.sc-listing-card-footer.sc-listing-card-footer-default > div:nth-child(3)"
        )?.text,
        url: `https://immobilien.derstandard.at/detail/${id}`,
        coordinates,
      };
    })
  );
}

function filterResults(results: BaseImmoResult[], filters: any) {
  return results;
}

function toImmoResult(result: RawStandardResult): BaseImmoResult {
  return {
    id: result.id.toString(),
    title: result.title ?? "No title",
    price: result.price ? Number(result.price.replace(/\D/g, "")) : 0,
    size: result.size ? Number(result.size.replace(/\D/g, "")) : 0,
    url: result.url ?? "",
    address: result.address ?? "",
    coordinates: result.coordinates,
    rooms: result.rooms ? Number(result.rooms.replace(/\D/g, "")) : 0,
  };
}
