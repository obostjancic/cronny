import {
  Job,
  JSONObject,
  Result,
  ResultStatus,
  Run,
  Runner,
  UnsavedResult,
} from "@cronny/types";
import { getJobResults, upsertResults } from "./db/result.js";
import { saveRun, updateRun } from "./db/run.js";
import { notifyRun } from "./notification/notify.js";
import { iso } from "./utils/date.js";
import logger from "./utils/logger.js";
import { equal } from "./utils/diff.js";

export async function executeRun(job: Job, runner: Runner): Promise<Run> {
  logger.info(`Running job ${job.name}`);
  let run = await startRun(job);
  let results = null;
  let resultDiff = 0;
  try {
    results = await runner(job.params);
  } catch (e) {
    logger.error(`Error running job ${job.name}`, e);
  } finally {
    const res = await finishRun(run.id, results);
    run = res.run;
    resultDiff = res.resultDiff;
  }
  if (job.notify) {
    notifyRun(job, run, resultDiff);
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
  results: JSONObject[] | null
): Promise<{ run: Run; resultDiff: number }> {
  const isSuccess = !!results;

  const savedRun = await updateRun(runId, {
    end: iso(),
    status: isSuccess ? "success" : "failure",
  });

  const newResults: UnsavedResult[] = (results ?? []).map((r) =>
    toResult(r, savedRun.jobId, savedRun.id)
  );

  const exisitingResults = await getJobResults(savedRun.jobId);
  const allResults = mergeResults(newResults, exisitingResults);

  await upsertResults(allResults);

  const resultDiff =
    newResults.filter((r) => r.status === "active").length -
    exisitingResults.filter((r) => r.status === "active").length;

  return { run: savedRun, resultDiff };
}

export function mergeResults(
  newResults: UnsavedResult[],
  existingResults: Result[]
): (Result | UnsavedResult)[] {
  const updatedExistingResults: Result[] = existingResults.map(
    (existingResult) => {
      const newResult = newResults.find((newResult) =>
        equalResults(newResult, existingResult)
      );

      if (newResult) {
        if (equal(newResult.data, existingResult.data)) {
          return existingResult;
        }
        return { ...existingResult, ...newResult };
      }
      return { ...existingResult, status: "expired" as ResultStatus };
    }
  );

  const newResultsToInsert = newResults.filter(
    (newResult) =>
      !existingResults.some((existingResult) =>
        equalResults(newResult, existingResult)
      )
  );

  return newResultsToInsert.concat(updatedExistingResults);
}

function equalResults(a: UnsavedResult, b: UnsavedResult) {
  if (a.internalId === b.internalId) {
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
