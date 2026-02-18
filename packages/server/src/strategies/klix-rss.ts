import { Runner } from "@cronny/types";
import { Type, type Static } from "@sinclair/typebox";
import { parse } from "node-html-parser";
import { runPrompt } from "../utils/ai.js";
import { cached } from "../utils/cache.js";
import { createLogger } from "../utils/logger.js";
import { fetchViaProxy } from "../utils/request.js";

const logger = createLogger("klix-rss");

const KLIX_NAJNOVIJE_URL = "https://www.klix.ba/najnovije";

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
  category: string;
};

const categoryMap: Record<string, string> = {
  vijesti: "news",
  sport: "sport",
  biznis: "business",
  magazin: "entertainment",
  lifestyle: "lifestyle",
  scitech: "science & tech",
  auto: "auto",
};

function extractCategory(href: string): string {
  const segment = href.split("/").filter(Boolean)[0] ?? "";
  return categoryMap[segment] ?? segment;
}

type Params = {
  systemPrompt: string;
  model?: string;
  fallbackModel?: string;
};

export const run: Runner<Params, Article> = async (params) => {
  const rawArticles = await fetchArticleList();
  const articlesWithText = await fetchArticleTexts(rawArticles);
  const processedArticles = await processArticles(articlesWithText, params!);

  return processedArticles;
};

async function fetchArticleList(): Promise<RawArticle[]> {
  logger.info(`Fetching article list from ${KLIX_NAJNOVIJE_URL}`);

  const response = await fetchViaProxy(KLIX_NAJNOVIJE_URL);
  const html = response.data as string;
  const root = parse(html);

  const articles = root.querySelectorAll("article");

  return articles.map((article) => {
    const anchorTag = article.querySelector("a");
    const href = anchorTag?.getAttribute("href") || "";
    const id = href.split("/").pop() || "";
    const title = anchorTag?.getAttribute("title") || "";

    return {
      id,
      title,
      url: `https://www.klix.ba${href}`,
      date: new Date().toISOString(),
      category: extractCategory(href),
    };
  });
}

async function fetchArticleTexts(
  rawArticles: RawArticle[],
): Promise<Article[]> {
  const articles: Article[] = [];

  for (const rawArticle of rawArticles) {
    logger.info(`Fetching article: ${rawArticle.title}`);

    try {
      const text = await cached(fetchArticleText)(rawArticle.url);
      articles.push({ ...rawArticle, text });
    } catch (error) {
      logger.error(`Failed to fetch article ${rawArticle.id}: ${error}`);
    }
  }

  return articles;
}

async function fetchArticleText(url: string): Promise<string> {
  const response = await fetchViaProxy(url);
  const html = response.data as string;
  const root = parse(html);

  const textElement = root.querySelector("#tekst");
  const excerpt = textElement?.querySelector("#excerpt > span")?.innerText;
  const paragraphs =
    textElement
      ?.querySelectorAll("#text > p")
      ?.map((p) => p.innerText)
      .filter(Boolean) ?? [];

  const text = [excerpt, ...paragraphs].join("\n");

  if (!text) {
    throw new Error(`No text found for article ${url}`);
  }

  return text;
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
