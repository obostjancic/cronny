"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatJSONArray = void 0;
const formatJSONArray = (arr) => {
    return JSON.stringify(arr, null, 2);
};
exports.formatJSONArray = formatJSONArray;
