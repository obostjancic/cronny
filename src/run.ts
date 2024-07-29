import * as Sentry from "@sentry/node";
import logger from "./utils/logger";
import * as db from "./db";
import { iso } from "./utils/date";
import { notify } from "./utils/notify";
import { formatJSONArray } from "./utils/format";
import { FinishedRun, JobConfig, Run } from "./types";

export async function executeRun(config: JobConfig): Promise<FinishedRun> {
  const run = startRun(config);
  try {
    run.results = await config.run();

    if (config.notify) {
      await notifyRun(run);
    }
  } catch (e) {
    run.error = e as Error;
  } finally {
    return await finishRun(run);
  }
}

function startRun(config: JobConfig): Run {
  logger.debug(`Starting run for job ${config.name}`);

  return {
    config,
    start: iso(),
    status: "running",
    span: Sentry.startInactiveSpan({ name: config.name }),
  };
}

async function finishRun(run: Run): Promise<FinishedRun> {
  const isSuccess = !run.error;
  if (isSuccess) {
    logger.debug(`Run for job ${run.config.name} finished, result`);
  } else {
    logger.error(`Error running job ${run.config.name}`, run.error);
  }

  const savedRun = await db.saveJobRun(run.config.id, {
    start: run.start,
    end: iso(),
    results: run.results,
    status: isSuccess ? "success" : "failure",
  });

  run.span.end();
  return savedRun;
}

async function notifyRun(run: Run): Promise<void> {
  const previousRun = await db.getLastRun(run.config.id);

  if (!previousRun) {
    logger.debug(`No previous run found for ${run.config.name}`);
    return;
  }

  const previousResults = previousRun.results ?? [];
  const currentResults = run.results ?? [];

  const newResults = currentResults.filter(
    (result) =>
      !previousResults.some(
        (prevResult) => JSON.stringify(prevResult) === JSON.stringify(result)
      )
  );

  if (newResults.length > 0) {
    notify(
      `New results found for ${run.config.name}`,
      formatJSONArray(newResults)
    );
    logger.debug(`New results found for ${run.config.name}`, newResults);
  }
}
