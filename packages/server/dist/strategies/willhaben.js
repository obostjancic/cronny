"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const node_html_parser_1 = require("node-html-parser");
const logger_1 = __importDefault(require("../utils/logger"));
async function run(params) {
    return await fetchWillhabenSearch(params);
}
async function fetchWillhabenSearch({ url, }) {
    const html = await fetchHtml(url);
    return extractResultList(html);
}
async function fetchHtml(url) {
    logger_1.default.debug(`Fetching ${url}`);
    const response = await fetch(url);
    return response.text();
}
function extractResultList(html) {
    const script = (0, node_html_parser_1.parse)(html).querySelector("body > script");
    if (!script) {
        throw new Error("No script found in page");
    }
    const json = JSON.parse(script.text);
    const { searchResult } = json.props.pageProps;
    const advertSummary = searchResult.advertSummaryList.advertSummary;
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
const reduceAttributes = (list) => {
    return list.reduce((acc, curr) => {
        acc[curr.name] = curr.values.join(" ");
        return acc;
    }, {});
};
