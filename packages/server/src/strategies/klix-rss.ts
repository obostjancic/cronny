import { Runner } from "@cronny/types";
import axios from "axios";
import { parse } from "node-html-parser";
import Parser from "rss-parser";
import { runPrompt } from "../utils/ai.js";
import { cached } from "../utils/cache.js";
import { getEnv } from "../utils/env.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("klix-rss");

export type Article = {
  id: string;
  title: string;
  url: string;
  date: string;
  text?: string;
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
  categories: { _: string; $: string }[];
};

export const run: Runner<undefined, Article> = async () => {
  const articles = await fetchFeed();
  const data = processArticles(articles);
  return data;
};

async function fetchFeed(): Promise<RawArticle[]> {
  const parser = new Parser<KlixFeed, RawArticle>();
  const feed = await parser.parseURL("https://www.klix.ba/rss");

  return feed.items;
}

async function processArticles(articles: RawArticle[]): Promise<Article[]> {
  const result = [];

  for (const article of articles) {
    const res = await cached(processArticle)(article);

    if (res) {
      result.push(res);
    }
  }

  return result;
}

async function processArticle(article: RawArticle): Promise<Article | null> {
  try {
    const text = await fetchArticleText(article.link);

    return await purify({
      id: article.guid,
      title: article.title,
      url: article.link,
      date: new Date(article.pubDate).toISOString(),
      text,
    });
  } catch (error) {
    logger.error(`Failed to process article ${article.guid}: ${error}`);
    return null;
  }
}

async function fetchArticleText(url: string): Promise<string> {
  const response = await axios.get(url);
  const html = response.data as string;

  const textElement = parse(html).querySelector("#tekst");
  const excerpt = textElement?.querySelector("#excerpt > span")?.innerText;
  const paragraphs =
    textElement
      ?.querySelectorAll("#text > p")
      ?.map((p) => p.innerText)
      .filter(Boolean) ?? [];

  const result = [excerpt, ...paragraphs].join("\n");

  return result;
}

async function purify(article: Article): Promise<Article> {
  const prompt = getEnv("PURIFICATION_PROMPT");
  const purified = await runPrompt(prompt + " " + article.text);

  const [title, ...text] = purified.split(";");

  return {
    ...article,
    text: text.join(". ").trim().replaceAll("  ", " "),
    title: title,
  };
}
