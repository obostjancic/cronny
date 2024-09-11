import { Job, Run, Runner } from "@cronny/types";
import { saveRun, updateRun } from "./db/run.js";
import { notifyRun } from "./notification/notify.js";
import { iso } from "./utils/date.js";
import logger from "./utils/logger.js";

export async function executeRun(job: Job, runner: Runner): Promise<void> {
  let run = await startRun(job);
  let results = null;
  try {
    results = await runner(job.params);
  } catch (e) {
    logger.error(`Error running job ${job.name}`, e);
    run.results = null;
  } finally {
    run = await finishRun(run.id, results);
  }
  if (job.notify) {
    notifyRun(run, job.notify);
  }
}

async function startRun(job: Job) {
  logger.debug(`Starting run for ${job.name}`);

  return saveRun({
    jobId: job.id,
    start: iso(),
    end: null,
    status: "running",
    results: null,
  });
}

async function finishRun(runId: number, results: any[] | null): Promise<Run> {
  const isSuccess = !!results;

  const savedRun = await updateRun(runId, {
    end: iso(),
    results: results,
    status: isSuccess ? "success" : "failure",
  });

  return savedRun;
}
