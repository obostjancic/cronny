import { parse } from "node-html-parser";
import { createLogger } from "../utils/logger.js";
import { fetchURL } from "../utils/request.js";
import { fetchMultiplePages } from "../utils/request.js";
import { replaceURLParams } from "../utils/url.js";
import { Runner } from "@cronny/types";

const MAX_ROWS = 90;
const MAX_PAGES = 5;

const logger = createLogger("willhaben");

type WillhabenParams = {
  url: string;
};

type WillhabenResult = {
  id: string;
  title: string;
  price: number;
  url: string;
} & Record<string, unknown>;

type AdvertSummary = {
  id: string;
  description: string;
  attributes: { attribute: { name: string; values: string[] }[] };
}[];

export const run: Runner<WillhabenParams, WillhabenResult> = async (params) => {
  const data = await fetchWillhabenSearch(params!);
  return { data };
};

async function fetchWillhabenSearch({
  url,
}: WillhabenParams): Promise<WillhabenResult[]> {
  const extendedUrl = replaceURLParams(url, { rows: MAX_ROWS });
  return fetchMultiplePages(
    extendedUrl,
    fetchWillhabenSearchPage,
    MAX_ROWS,
    MAX_PAGES
  );
}

async function fetchWillhabenSearchPage(
  url: string,
  page = 1
): Promise<WillhabenResult[]> {
  const urlWithPage = replaceURLParams(url, { page });
  const html = await fetchHtml(urlWithPage);
  return extractResultList(html);
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetchURL(url);
  return response.text();
}

function extractResultList(html: string): WillhabenResult[] {
  const script = parse(html).querySelector("body > script");

  if (!script) {
    throw new Error("No script found in page");
  }

  const json = JSON.parse(script.text);
  const { searchResult } = json.props.pageProps;
  const advertSummary: AdvertSummary =
    searchResult?.advertSummaryList?.advertSummary;

  if (!advertSummary) {
    return [];
  }

  return advertSummary.map((result) => {
    const attrs = reduceAttributes(result.attributes.attribute);

    return {
      id: result.id,
      ...attrs,
      title: attrs.HEADING,
      price: Number(attrs.PRICE),
      url: `https://www.willhaben.at/iad/object?adId=${result.id}`,
    };
  });
}

const reduceAttributes = (list: any[]) => {
  return list.reduce((acc, curr) => {
    acc[curr.name] = curr.values.join(" ");
    return acc;
  }, {});
};
