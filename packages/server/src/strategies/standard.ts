import { Coordinates, Runner } from "@cronny/types";
import axios from "axios";
import { parse, type HTMLElement } from "node-html-parser";
import { cached } from "../utils/cache.js";
import { geocode } from "../utils/coordinates.js";
import { createLogger } from "../utils/logger.js";
import { fetchMultiplePages } from "../utils/request.js";
import { sanitize } from "../utils/string.js";
import { replaceURLParams } from "../utils/url.js";
import { BaseImmoParams, BaseImmoResult, filterResults } from "./immo.base.js";

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
  if (!rawResults) {
    return [];
  }

  const results = rawResults.map(toImmoResult);

  return filterResults(results, filters);
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
        getString(
          item.querySelector(
            "div.sc-listing-card-body-main-content > div:first-child > div"
          )
        ) ?? "Wien";

      const coordinates = await cached(geocode)(address);

      return {
        id: id,
        title: getString(
          item.querySelector(
            "div.sc-listing-card-body-main-content > div > div.sc-listing-card-title-no-margin"
          )
        ),
        price: getString(
          item.querySelector(
            "div.sc-listing-card-footer.sc-listing-card-footer-default > div:nth-child(1)"
          )
        ),
        address,
        size: getString(
          item.querySelector(
            "div.sc-listing-card-footer.sc-listing-card-footer-default > div:nth-child(2)"
          )
        ),
        rooms: getString(
          item.querySelector(
            "div.sc-listing-card-footer.sc-listing-card-footer-default > div:nth-child(3)"
          )
        ),
        url: `https://immobilien.derstandard.at/detail/${id}`,
        coordinates,
      };
    })
  );
}

const getString = (element: HTMLElement | null) => sanitize(element?.text);

function toImmoResult(result: RawStandardResult): BaseImmoResult {
  const price = result.price
    ? Number(result.price.split(" ")[1].replace(".", "").replace(",", "."))
    : 0;

  const size = result.size
    ? Number(result.size.split(" ")[0].replace(",", "."))
    : 0;

  return {
    id: result.id.toString(),
    title: result.title ?? "No title",
    price: price,
    size: size,
    url: result.url ?? "",
    address: result.address ?? "",
    coordinates: result.coordinates,
    rooms: result.rooms ? Number(result.rooms.replace(/\D/g, "")) : 0,
  };
}
