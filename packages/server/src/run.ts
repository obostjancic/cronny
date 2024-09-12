import {
  Job,
  JSONArray,
  JSONObject,
  Run,
  Runner,
  RunResult,
} from "@cronny/types";
import { saveRun, updateRun } from "./db/run.js";
import { notifyRun } from "./notification/notify.js";
import { iso } from "./utils/date.js";
import logger from "./utils/logger.js";

export async function executeRun(job: Job, runner: Runner): Promise<void> {
  let run = await startRun(job);
  let data = null;
  try {
    data = await runner(job.params);
  } catch (e) {
    logger.error(`Error running job ${job.name}`, e);
    run.data = [];
  } finally {
    run = await finishRun(run.id, data);
  }
  if (job.notify) {
    notifyRun(run, job.name, job.notify);
  }
}

async function startRun(job: Job) {
  logger.debug(`Starting run for ${job.name}`);

  return saveRun({
    jobId: job.id,
    start: iso(),
    end: null,
    status: "running",
    data: [],
    meta: undefined,
  });
}

async function finishRun(runId: number, data: RunResult | null): Promise<Run> {
  const isSuccess = !!data;

  const savedRun = await updateRun(runId, {
    end: iso(),
    status: isSuccess ? "success" : "failure",
    ...data,
  });

  return savedRun;
}
