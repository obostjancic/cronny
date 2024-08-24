import { parse } from "node-html-parser";
import logger from "../utils/logger.js";
export async function run(params) {
    return await fetchWillhabenSearch(params);
}
async function fetchWillhabenSearch({ url, }) {
    const html = await fetchHtml(url);
    return extractResultList(html);
}
async function fetchHtml(url) {
    logger.debug(`Fetching ${url}`);
    const response = await fetch(url);
    return response.text();
}
function extractResultList(html) {
    const script = parse(html).querySelector("body > script");
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
