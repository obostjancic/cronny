"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = exports.sleep = void 0;
const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
exports.sleep = sleep;
const retry = async (fn, { retries = 3, delay = 1000, backoff = 2 } = {}) => {
    try {
        return await fn();
    }
    catch (e) {
        if (retries === 1) {
            throw e;
        }
        await (0, exports.sleep)(delay);
        return (0, exports.retry)(fn, { retries: retries - 1, delay: delay * backoff, backoff });
    }
};
exports.retry = retry;
