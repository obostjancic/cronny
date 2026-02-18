import { Runner, RunnerOptions } from "@cronny/types";
import { Type, type Static } from "@sinclair/typebox";
import RSSParser from "rss-parser";
import { parse } from "node-html-parser";
import { runPrompt } from "../utils/ai.js";
import { cached } from "../utils/cache.js";
import { createLogger } from "../utils/logger.js";
import { fetchViaProxy } from "../utils/request.js";

const logger = createLogger("standard-rss");

const RSS_URL = "https://www.derstandard.at/rss";

export const ResultSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  url: Type.String(),
  date: Type.String(),
  category: Type.String(),
  text: Type.Optional(Type.String()),
});

type Article = Static<typeof ResultSchema>;

type RawArticle = {
  id: string;
  title: string;
  url: string;
  date: string;
};

const categoryMap: Record<string, string> = {
  inland: "domestic",
  international: "world",
  wirtschaft: "business",
  sport: "sport",
  web: "tech",
  panorama: "panorama",
  kultur: "culture",
  wissenschaft: "science",
  lifestyle: "lifestyle",
  etat: "media",
};

function extractCategoryFromTitle(titleTag: string): string {
  const parts = titleTag.split(" - ");
  if (parts.length < 2) return "unknown";
  const segment = parts[parts.length - 2].trim().toLowerCase();
  return categoryMap[segment] ?? segment;
}

type Params = {
  systemPrompt: string;
  model?: string;
  fallbackModel?: string;
};

export const run: Runner<Params, Article> = async (params, options) => {
  const rawArticles = await fetchArticleList();
  const limited = options?.maxResults ? rawArticles.slice(0, options.maxResults) : rawArticles;
  const articlesWithText = await fetchArticleTexts(limited);
  const processedArticles = await processArticles(articlesWithText, params!);

  return processedArticles;
};

async function fetchArticleList(): Promise<RawArticle[]> {
  logger.info(`Fetching RSS feed from ${RSS_URL}`);

  const parser = new RSSParser();
  const feed = await parser.parseURL(RSS_URL);

  return (feed.items ?? []).map((item) => ({
    id: item.guid || item.link || "",
    title: item.title || "",
    url: item.link || "",
    date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
  }));
}

async function fetchArticleTexts(
  rawArticles: RawArticle[],
): Promise<Article[]> {
  const articles: Article[] = [];

  for (const rawArticle of rawArticles) {
    logger.info(`Fetching article: ${rawArticle.title}`);

    try {
      const content = await cached(fetchArticleText)(rawArticle.url);
      if (typeof content === "string") {
        articles.push({ ...rawArticle, text: content, category: "unknown" });
      } else {
        articles.push({ ...rawArticle, ...content });
      }
    } catch (error) {
      logger.error(`Failed to fetch article ${rawArticle.id}: ${error}`);
    }
  }

  return articles;
}

async function fetchArticleText(url: string): Promise<{ text: string; category: string }> {
  const response = await fetchViaProxy(url);
  const html = response.data as string;
  const root = parse(html);

  const paragraphs =
    root
      .querySelectorAll("div.article-body p")
      ?.map((p) => p.innerText)
      .filter(Boolean) ?? [];

  const text = paragraphs.join("\n");

  if (!text) {
    throw new Error(`No text found for article ${url}`);
  }

  const titleTag = root.querySelector("title")?.innerText ?? "";
  const category = extractCategoryFromTitle(titleTag);

  return { text, category };
}

async function processArticles(
  articles: Article[],
  params: Params,
): Promise<Article[]> {
  const result: Article[] = [];

  for (const article of articles) {
    try {
      const simplified = await cached(simplifyArticle, article.id)(
        article,
        params,
      );
      result.push(simplified);
    } catch (error) {
      logger.error(`Failed to process article ${article.id}: ${error}`);
    }
  }

  return result;
}

async function simplifyArticle(
  article: Article,
  params: Params,
): Promise<Article> {
  const purified = await runPrompt(
    params.systemPrompt,
    article.text ?? "",
    params.model,
    params.fallbackModel,
  );
  const [title, ...text] = purified.split(";");

  return {
    ...article,
    text: sanitizeText(text.join(". ")),
    title: sanitizeTitle(title),
  };
}

function sanitizeText(text: string): string {
  return text
    .trim()
    .replaceAll("'. '", "")
    .replaceAll(" . ", "")
    .replaceAll("..", ".")
    .replaceAll("  ", " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function sanitizeTitle(title: string): string {
  return title
    .replaceAll("## ", "")
    .replaceAll("##", "")
    .replaceAll("*", "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .trim();
}
