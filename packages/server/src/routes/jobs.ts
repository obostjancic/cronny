import type { Job, UnsavedJob } from "@cronny/types";
import { Hono } from "hono";
import { getJob, getJobs, saveJob, updateJob } from "../db/job.js";
import { deleteJobResults, getJobResults } from "../db/result.js";
import { getJobRuns, getLastRun, getRun } from "../db/run.js";
import { executeRun } from "../run.js";
import { getRunner, invalidateSchedule } from "../schedule.js";

export const jobsRoutes = new Hono();

jobsRoutes.get("/", async (c) => {
  const jobs = await getJobs();
  return c.json(jobs);
});

jobsRoutes.post("/", async (c) => {
  const body = await c.req.json<UnsavedJob>();
  const job = await saveJob(body);

  invalidateSchedule();

  return c.json(job);
});

jobsRoutes.get("/:id", async (c) => {
  const job = await getJob(+c.req.param("id"));
  const runs = await getJobRuns(+c.req.param("id"));
  const results = await getJobResults(+c.req.param("id"));

  return c.json({ ...job, results, runs });
});

jobsRoutes.patch("/:id", async (c) => {
  const { id, ...patch } = await c.req.json<Partial<Job>>();
  const jobId = Number(c.req.param("id") ?? id);
  const job = await updateJob(jobId, patch);

  await invalidateSchedule();

  return c.json(job);
});

jobsRoutes.post("/:id/runs", async (c) => {
  const job = await getJob(+c.req.param("id"));
  if (!job) {
    return c.status(404);
  }

  const runner = await getRunner(job);
  const run = await executeRun(job, runner);

  return c.json(run);
});

jobsRoutes.delete("/:id/runs", async (c) => {
  const job = await getJob(+c.req.param("id"));
  if (!job) {
    return c.status(404);
  }

  await deleteJobResults(job.id);

  return c.body(null, 204);
});

jobsRoutes.get("/:id/runs/:runId", async (c) => {
  const runId = c.req.param("runId");
  if (runId === "latest") {
    const run = await getLastRun(+c.req.param("id"));
    return c.json(run);
  }
  const run = await getRun(+runId);
  return c.json(run);
});

jobsRoutes.get("/:id/results/", async (c) => {
  const results = await getJobResults(+c.req.param("id"));
  return c.json(results);
});

jobsRoutes.delete("/:id/results", async (c) => {
  const job = await getJob(+c.req.param("id"));
  if (!job) {
    return c.status(404);
  }

  await deleteJobResults(job.id);

  return c.body(null, 204);
});
