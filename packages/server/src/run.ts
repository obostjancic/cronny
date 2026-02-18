import {
  Job,
  JSONObject,
  ResultStatus,
  Run,
  Runner,
  UnsavedResult,
} from "@cronny/types";
import { getNonExpiredResults, upsertResults } from "./db/result.js";
import { saveRun, updateRun } from "./db/run.js";
import { notifyRun } from "./notification/notify.js";
import { iso } from "./utils/date.js";
import { equal } from "./utils/diff.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("run");

export async function executeRun(job: Job, runner: Runner): Promise<Run> {
  logger.info(`Running job ${job.name}`);
  let run = await startRun(job);
  let results = null;
  let resultDiff = 0;
  try {
    results = await runner(job.params, { maxResults: job.maxResults });
  } catch (e) {
    logger.error(`Error running job ${job.name}`);
    logger.error(e);
  } finally {
    const res = await finishRun(run.id, results, job.maxResults);
    run = res.run;
    resultDiff = res.resultDiff;
  }
  if (job.notify) {
    await notifyRun(job, run, resultDiff);
  }

  return run;
}

async function startRun(job: Job) {
  return saveRun({
    jobId: job.id,
    start: iso(),
    end: null,
    status: "running",
  });
}

async function finishRun(
  runId: number,
  results: JSONObject[] | null,
  maxResults: number = 100
): Promise<{ run: Run; resultDiff: number }> {
  const isSuccess = !!results;
  const cappedResults = results?.slice(0, maxResults) ?? null;

  const savedRun = await updateRun(runId, {
    end: iso(),
    status: isSuccess ? "success" : "failure",
  });

  const newlyAddedActiveResults = await updateJobResultState(
    savedRun,
    cappedResults ?? []
  );

  return { run: savedRun, resultDiff: newlyAddedActiveResults.length };
}

async function updateJobResultState(run: Run, results: JSONObject[]) {
  const newResults: UnsavedResult[] = results.map((r) =>
    toResult(r, run.jobId, run.id)
  );

  logger.debug(`Got ${newResults.length} new results`);

  const existingResults = await getNonExpiredResults(run.jobId);

  logger.debug(`Found ${existingResults.length} existing results`);

  // Build a Set of existing internalIds for O(1) lookup
  const existingIdSet = new Set(
    existingResults.filter((r) => r.internalId).map((r) => r.internalId)
  );

  const newlyAddedResults = newResults.filter(
    (newResult) => {
      if (newResult.internalId && existingIdSet.has(newResult.internalId)) {
        return false;
      }
      // Fall back to deep comparison only for results without matching internalId
      if (!newResult.internalId) {
        return !existingResults.some((existing) => equalResults(newResult, existing));
      }
      return true;
    }
  );

  logger.debug(`Diff: ${newlyAddedResults.length} newly added results`);

  await upsertResults(newlyAddedResults);

  // Build a Set of new internalIds for O(1) lookup
  const newIdSet = new Set(
    newResults.filter((r) => r.internalId).map((r) => r.internalId)
  );

  const expiredResults = existingResults
    .filter((existing) => {
      if (existing.internalId && newIdSet.has(existing.internalId)) {
        return false;
      }
      if (!existing.internalId) {
        return !newResults.some((newResult) => equalResults(newResult, existing));
      }
      return true;
    })
    .map((r) => ({ ...r, status: "expired" as ResultStatus }));

  logger.debug(`Diff: ${expiredResults.length} expired results`);

  await upsertResults(expiredResults);

  const newlyAddedActiveResults = newlyAddedResults.filter(
    (r) => r.status === "active"
  );

  logger.debug(`Diff: ${newlyAddedActiveResults.length} ACTIVE results`);

  return newlyAddedActiveResults;
}

export function equalResults(a: UnsavedResult, b: UnsavedResult) {
  if (a.internalId && b.internalId && a.internalId === b.internalId) {
    return true;
  }

  const { id, ...restA } = a.data;
  const { id: _, ...restB } = b.data;

  return equal(restA, restB);
}

export function toResult(
  data: JSONObject,
  jobId: number,
  runId: number
): UnsavedResult {
  return {
    jobId,
    runId,
    internalId: `${data.id}`,
    data,
    status: (data.status ?? "active") as ResultStatus,
    isHidden: false,
  };
}
