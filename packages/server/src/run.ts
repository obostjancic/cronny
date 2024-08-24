import { SavedRun, saveRun, updateRun } from "./db/schema.js";
import { notifyRun } from "./notification/notify.js";
import { JobConfig, Runner } from "@cronny/types";
import { iso } from "./utils/date.js";
import logger from "./utils/logger.js";

export async function executeRun(
  config: JobConfig,
  runner: Runner
): Promise<void> {
  let run = await startRun(config);
  let results = null;
  try {
    results = await runner(run.config.params);
  } catch (e) {
    logger.error(`Error running job ${run.config.name}`, e);
    run.results = null;
  } finally {
    run = await finishRun(run.id, results);
  }

  notifyRun(run);
}

async function startRun(config: JobConfig) {
  logger.debug(`Starting run for ${config.name}`);

  return saveRun({
    jobId: config.jobId,
    start: iso(),
    end: null,
    status: "running",
    results: null,
    config: config,
  });
}

async function finishRun(
  runId: number,
  results: any[] | null
): Promise<SavedRun> {
  const isSuccess = !!results;

  const savedRun = await updateRun(runId, {
    end: iso(),
    results: results,
    status: isSuccess ? "success" : "failure",
  });

  return savedRun;
}
