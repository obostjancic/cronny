import logger from "../utils/logger.js";

export async function run(params?: any) {
  logger.log("Running stub job", params);
  return [];
}
