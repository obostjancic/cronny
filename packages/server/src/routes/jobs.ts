import { Request, Response } from "express";

import AsyncRouter from "./router.js";
import { getJob, getJobs } from "../db/job.js";
import { getJobRuns, getLastRun, getRun } from "../db/run.js";

const router = AsyncRouter();

router.get("/", async (_: Request, res: Response) => {
  const jobs = await getJobs();
  res.json(jobs);
});

router.get("/:id", async (req: Request, res: Response) => {
  const job = await getJob(+req.params.id);
  const runs = await getJobRuns(+req.params.id);
  res.json({ ...job, runs });
});

router.get("/:id/runs/:runId", async (req: Request, res: Response) => {
  if (req.params.runId === "latest") {
    const run = await getLastRun(+req.params.id);
    res.json(run);
    return;
  }
  const run = await getRun(+req.params.runId);
  res.json(run);
});

export default router;
