import logger from "../utils/logger";

export async function run(params?: any) {
  logger.log("Running stub job", params);
  return [];
}
