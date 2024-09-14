import type { Runner } from "@cronny/types";
import logger from "../utils/logger.js";

export const run: Runner = async () => {
  logger.log("Running stub job");

  return [];
};
