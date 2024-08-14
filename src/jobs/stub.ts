import logger from "../utils/logger";

// TODO: replace type
export async function run(params?: any) {
  logger.log("Running stub job", params);
  return [];
}
