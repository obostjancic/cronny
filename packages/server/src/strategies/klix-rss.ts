// @ts-ignore
import Parser from "rss-parser";
import logger from "../utils/logger.js";
import { Runner } from "@cronny/types";

export type Article = {
  id: string;
  title: string;
  url: string;
  date: string;
  content: string;
};

type KlixFeed = {
  title: string;
  link: string;
  description: string;
  language: string;
  pubDate: string;
  items: Article[];
};

type RawArticle = {
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  categories: { _: string; $: string }[];
};

export const run: Runner<undefined, Article> = async () => {
  const articles = await fetchFeed();
  const data = processArticles(articles);
  return { data };
};

async function fetchFeed(): Promise<RawArticle[]> {
  logger.log("Fetching feed");
  // const parser = { parseURL: (url: string) => Promise.resolve({ items: [] }) };
  const parser = new Parser<KlixFeed, RawArticle>();
  const feed = await parser.parseURL("https://www.klix.ba/rss");

  return feed.items;
}

function processArticles(articles: RawArticle[]): Article[] {
  return articles
    .filter((article) => article.categories?.[0]._ === "BiH")
    .map((article) => ({
      id: article.guid,
      title: article.title,
      url: article.link,
      date: new Date(article.pubDate).toISOString(),
      content: article.content,
    }));
}
