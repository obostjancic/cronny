"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.getEnv = void 0;
const getEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing env var: ${key}`);
    }
    return value;
};
exports.getEnv = getEnv;
exports.isProd = (0, exports.getEnv)("NODE_ENV") === "production";
