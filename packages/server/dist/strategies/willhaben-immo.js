"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const coordinates_1 = require("../utils/coordinates");
const willhaben_1 = require("./willhaben");
async function run(params) {
    return await fetchWillhabenImmoSearch(params);
}
async function fetchWillhabenImmoSearch({ url, center, radius, }) {
    const genericResults = await (0, willhaben_1.run)({ url });
    const flatResults = genericResults.map((result) => {
        return {
            id: result.id,
            title: `${result.HEADING}`,
            price: Number(result.PRICE),
            address: `${result.ADDRESS}`,
            floor: Number(result.FLOOR),
            rooms: Number(result.NUMBER_OF_ROOMS),
            coords: `${result.COORDINATES}`,
            url: `https://www.willhaben.at/iad/object?adId=${result.id}`,
        };
    });
    return flatResults.filter((result) => {
        if (!center || !result.coords || typeof result.coords !== "string") {
            return false;
        }
        const parsedCoords = (0, coordinates_1.parseCoordinates)(result.coords);
        if (!parsedCoords) {
            return false;
        }
        return (0, coordinates_1.isWithinRadius)(center, radius, parsedCoords);
    });
}
