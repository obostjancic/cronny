// @ts-ignore
import Parser from "rss-parser";
import logger from "../utils/logger.js";
async function fetchFeed() {
    logger.log("Fetching feed");
    // const parser = { parseURL: (url: string) => Promise.resolve({ items: [] }) };
    const parser = new Parser();
    const feed = await parser.parseURL("https://www.klix.ba/rss");
    return feed.items;
}
function processArticles(articles) {
    return articles
        .filter((article) => article.categories?.[0]._ === "BiH")
        .map((article) => ({
        id: article.guid,
        title: article.title,
        link: article.link,
        date: new Date(article.pubDate).toISOString(),
        content: article.content,
    }));
}
export async function run() {
    const articles = await fetchFeed();
    return processArticles(articles);
}
