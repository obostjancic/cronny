import type { Job, JobWithTiming, UnsavedJob } from "@cronny/types";
import { CronJob } from "cron";
import { Hono } from "hono";
import { deleteJob, getJob, getJobs, saveJob, updateJob } from "../db/job.js";
import { deleteJobResults, getJobResults } from "../db/result.js";
import { deleteJobRuns, getJobRuns, getLastRun, getRun } from "../db/run.js";
import { executeRun } from "../run.js";
import { getRunner, invalidateSchedule } from "../schedule.js";

function parseId(raw: string): number | null {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function getNextRunTime(cronExpression: string): string | undefined {
  try {
    const cronJob = new CronJob(cronExpression, () => {});
    const nextDate = cronJob.nextDate();
    return nextDate.toISO() ?? undefined;
  } catch {
    return undefined;
  }
}

export const jobsRoutes = new Hono();

jobsRoutes.get("/", async (c) => {
  const jobs = await getJobs();
  const jobsWithTiming: JobWithTiming[] = await Promise.all(
    jobs.map(async (job) => {
      const lastRun = await getLastRun(job.id);
      return {
        ...job,
        lastRun: lastRun?.start,
        nextRun: job.enabled ? getNextRunTime(job.cron) : undefined,
      };
    })
  );
  return c.json(jobsWithTiming);
});

jobsRoutes.post("/", async (c) => {
  const body = await c.req.json<UnsavedJob>();
  const job = await saveJob(body);

  await invalidateSchedule();

  return c.json(job);
});

jobsRoutes.get("/:id", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const job = await getJob(jobId);
  if (!job) return c.notFound();

  const runs = await getJobRuns(jobId);
  const results = await getJobResults(jobId);
  const nextRun = job.enabled ? getNextRunTime(job.cron) : undefined;

  return c.json({ ...job, results, runs, nextRun });
});

jobsRoutes.patch("/:id", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const { id, ...patch } = await c.req.json<Partial<Job>>();
  const job = await updateJob(jobId, patch);

  await invalidateSchedule();

  return c.json(job);
});

jobsRoutes.delete("/:id", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const job = await getJob(jobId);
  if (!job) return c.notFound();

  // Delete in order: results -> runs -> job
  await deleteJobResults(jobId);
  await deleteJobRuns(jobId);
  await deleteJob(jobId);

  await invalidateSchedule();

  return c.body(null, 204);
});

jobsRoutes.post("/:id/runs", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const job = await getJob(jobId);
  if (!job) return c.notFound();

  const runner = await getRunner(job);
  const run = await executeRun(job, runner);

  return c.json(run);
});

jobsRoutes.delete("/:id/runs", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const job = await getJob(jobId);
  if (!job) return c.notFound();

  await deleteJobResults(job.id);
  await deleteJobRuns(job.id);

  return c.body(null, 204);
});

jobsRoutes.get("/:id/runs/:runId", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const runId = c.req.param("runId");
  if (runId === "latest") {
    const run = await getLastRun(jobId);
    return c.json(run);
  }

  const parsedRunId = parseId(runId);
  if (!parsedRunId) return c.json({ error: "Invalid run ID" }, 400);

  const run = await getRun(parsedRunId);
  return c.json(run);
});

jobsRoutes.get("/:id/results/", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const results = await getJobResults(jobId);
  return c.json(results);
});

jobsRoutes.delete("/:id/results", async (c) => {
  const jobId = parseId(c.req.param("id"));
  if (!jobId) return c.json({ error: "Invalid job ID" }, 400);

  const job = await getJob(jobId);
  if (!job) return c.notFound();

  await deleteJobResults(job.id);

  return c.body(null, 204);
});
