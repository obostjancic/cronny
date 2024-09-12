import { Request, Response } from "express";

import AsyncRouter from "./router.js";
import { getJob, getJobs, saveJob, updateJob } from "../db/job.js";
import { getJobRuns, getLastRun, getRun } from "../db/run.js";
import { UnsavedJob } from "@cronny/types";
import { getRunner, invalidateSchedule } from "../schedule.js";
import { executeRun } from "../run.js";

const router = AsyncRouter();

router.get("/", async (_: Request, res: Response) => {
  const jobs = await getJobs();
  return res.json(jobs);
});

router.get("/:id", async (req: Request, res: Response) => {
  const job = await getJob(+req.params.id);
  const runs = await getJobRuns(+req.params.id);
  return res.json({ ...job, runs });
});

router.post("/:id", async (req: Request, res: Response) => {
  const body = req.body as UnsavedJob;
  const job = await saveJob(body);

  await invalidateSchedule();

  return res.json(job);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const job = await updateJob(+req.params.id, req.body);

  await invalidateSchedule();

  return res.json(job);
});

router.post("/:id/runs", async (req: Request, res: Response) => {
  const job = await getJob(+req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const runner = await getRunner(job);
  executeRun(job, runner);

  return res.json({ message: "Job started" });
});

router.get("/:id/runs/:runId", async (req: Request, res: Response) => {
  if (req.params.runId === "latest") {
    const run = await getLastRun(+req.params.id);
    return res.json(run);
    return;
  }
  const run = await getRun(+req.params.runId);
  return res.json(run);
});

export default router;
