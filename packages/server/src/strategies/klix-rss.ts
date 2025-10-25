import { Runner } from "@cronny/types";
import { Type, type Static } from "@sinclair/typebox";
import { parse } from "node-html-parser";
import Parser from "rss-parser";
import { runPrompt } from "../utils/ai.js";
import { cached } from "../utils/cache.js";
import { createLogger } from "../utils/logger.js";
import { fetchViaProxy } from "../utils/request.js";

const logger = createLogger("klix-rss");

export const ResultSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  url: Type.String(),
  date: Type.String(),
  text: Type.Optional(Type.String()),
});

type Article = Static<typeof ResultSchema>;

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

type ArticleWithText = {
  id: string;
  title: string;
  url: string;
  date: string;
  text: string;
};

type Params = {
  systemPrompt: string;
};

export const run: Runner<Params, Article> = async (params) => {
  const rawArticles = await fetchFeed();

  const articlesWithText = await fetchAllArticleTexts(rawArticles);

  const processedArticles = await processArticles(
    articlesWithText,
    params?.systemPrompt!,
  );

  return processedArticles;
};

async function fetchFeed(): Promise<RawArticle[]> {
  const parser = new Parser<KlixFeed, RawArticle>();
  const feed = await parser.parseURL("https://www.klix.ba/rss");

  return feed.items;
}

async function fetchAllArticleTexts(
  rawArticles: RawArticle[],
): Promise<ArticleWithText[]> {
  const articlesWithText: ArticleWithText[] = [];

  //comment
  for (const rawArticle of rawArticles) {
    logger.info(`Fetching article: ${rawArticle.title}`);

    try {
      const text = await fetchArticleText(rawArticle.link);

      articlesWithText.push({
        id: rawArticle.guid,
        title: rawArticle.title,
        url: rawArticle.link,
        date: new Date(rawArticle.pubDate).toISOString(),
        text,
      });
    } catch (error) {
      logger.error(`Failed to fetch article ${rawArticle.guid}: ${error}`);
    }
  }

  return articlesWithText;
}

async function fetchArticleText(url: string): Promise<string> {
  logger.debug(`Fetching ${url}`);

  const response = await fetchViaProxy(url);
  const html = response.data as string;

  const textElement = parse(html).querySelector("#tekst");
  const excerpt = textElement?.querySelector("#excerpt > span")?.innerText;
  const paragraphs =
    textElement
      ?.querySelectorAll("#text > p")
      ?.map((p) => p.innerText)
      .filter(Boolean) ?? [];

  const result = [excerpt, ...paragraphs].join("\n");

  if (!result) {
    throw new Error(`No text found for article ${url}`);
  }

  return result;
}

async function processArticles(
  articles: ArticleWithText[],
  simplificationPrompt: string,
): Promise<Article[]> {
  const result: Article[] = [];

  for (const article of articles) {
    try {
      const simplified = await cached(simplify)(article, simplificationPrompt);
      result.push(simplified);
    } catch (error) {
      logger.error(`Failed to process article ${article.id}: ${error}`);
    }
  }

  return result;
}

async function simplify(
  article: ArticleWithText,
  prompt: string,
): Promise<Article> {
  const purified = await runPrompt(prompt, article.text);

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
    .replaceAll("..", ".")
    .replaceAll("  ", " ")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function sanitizeTitle(title: string): string {
  return title
    .replaceAll("## ", "")
    .replaceAll("##", "")
    .replaceAll("*", "")
    .trim();
}
