import { Runner } from "@cronny/types";
import { Filter } from "../utils/filter.js";
import { createLogger } from "../utils/logger.js";
import { BaseImmoResult } from "./immo.base.js";
import { run as runImmoscoutImmo } from "./immoscout.js";
import { run as runStandardImmo } from "./standard.js";
import { run as runWillhabenImmo } from "./willhaben-immo.js";

const logger = createLogger("immo");

export type ImmoParams = {
  sources: {
    willhaben?: {
      url: string;
    };
    immoscout?: {
      url: string;
    };
    standard?: {
      url: string;
    };
  };
} & { filters?: Filter<BaseImmoResult>[] };

export const run: Runner<ImmoParams, BaseImmoResult> = async (params) => {
  if (!params) {
    throw new Error("Missing params");
  }

  const willhabenImmoResults = params.sources.willhaben
    ? await runWillhabenImmo({
        url: params.sources.willhaben.url,
        filters: params.filters,
      })
    : [];

  const immoscoutResults = params.sources.immoscout
    ? await runImmoscoutImmo({
        url: params.sources.immoscout.url,
        filters: params.filters,
      })
    : [];

  const standardResults = params.sources.standard
    ? await runStandardImmo({
        url: params.sources.standard.url,
        filters: params.filters,
      })
    : [];

  const dedupedResults = [
    ...(willhabenImmoResults ?? []),
    ...(immoscoutResults ?? []),
    ...(standardResults ?? []),
  ].filter(
    (result, index, self) =>
      index === self.findIndex((t) => t.title === result.title)
  );

  logger.debug(`Found ${dedupedResults.length} results`);

  return dedupedResults;
};
