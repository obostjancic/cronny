export const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
export const retry = async (fn, { retries = 3, delay = 1000, backoff = 2 } = {}) => {
    try {
        return await fn();
    }
    catch (e) {
        if (retries === 1) {
            throw e;
        }
        await sleep(delay);
        return retry(fn, { retries: retries - 1, delay: delay * backoff, backoff });
    }
};
