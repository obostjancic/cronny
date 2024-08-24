import { Request, Response } from "express";
import {
  getJob,
  getJobRuns,
  getLastRun,
  getRun,
  getSchedule,
} from "../db/schema.js";
import AsyncRouter from "./router.js";

const router = AsyncRouter();

router.get("/", async (_: Request, res: Response) => {
  const jobs = await getSchedule();
  res.json(jobs);
});

router.get("/:jobId", async (req: Request, res: Response) => {
  const job = await getJob(req.params.jobId);
  res.json(job);
});

router.get("/:jobId/runs", async (req: Request, res: Response) => {
  const runs = await getJobRuns(req.params.jobId);
  res.json(runs);
});

router.get("/:jobId/runs/:runId", async (req: Request, res: Response) => {
  if (req.params.runId === "latest") {
    const run = await getLastRun(req.params.jobId);
    res.json(run);
    return;
  }
  const run = await getRun(+req.params.jobId);

  res.json(run);
});

export default router;