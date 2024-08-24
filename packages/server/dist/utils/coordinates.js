"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCoordinates = parseCoordinates;
exports.distance = distance;
exports.isWithinRadius = isWithinRadius;
function parseCoordinates(coordinates) {
    try {
        const [latitude, longitude] = coordinates.split(",").map(Number);
        return [latitude, longitude];
    }
    catch (e) {
        return null;
    }
}
function distance([lat1, lon1], [lat2, lon2]) {
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 -
        c((lat2 - lat1) * p) / 2 +
        (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
function isWithinRadius(center, radius, target) {
    return distance(center, target) <= radius;
}
