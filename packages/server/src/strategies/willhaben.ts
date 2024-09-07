import { parse } from "node-html-parser";
import logger from "../utils/logger.js";

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

export async function run(params: WillhabenParams): Promise<WillhabenResult[]> {
  return await fetchWillhabenSearch(params);
}

async function fetchWillhabenSearch({
  url,
}: WillhabenParams): Promise<WillhabenResult[]> {
  const extendedUrl = `${url}&rows=100`;
  const html = await fetchHtml(extendedUrl);
  return extractResultList(html);
}

async function fetchHtml(url: string): Promise<string> {
  logger.debug(`Fetching ${url}`);

  const response = await fetch(url);
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
    searchResult.advertSummaryList.advertSummary;

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
