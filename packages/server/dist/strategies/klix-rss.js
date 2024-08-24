"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
// @ts-ignore
const rss_parser_1 = __importDefault(require("rss-parser"));
const logger_1 = __importDefault(require("../utils/logger"));
async function fetchFeed() {
    logger_1.default.log("Fetching feed");
    // const parser = { parseURL: (url: string) => Promise.resolve({ items: [] }) };
    const parser = new rss_parser_1.default();
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
async function run() {
    const articles = await fetchFeed();
    return processArticles(articles);
}
