import logger from "../utils/logger.js";
export async function run(params) {
    logger.log("Running stub job", params);
    return [];
}
