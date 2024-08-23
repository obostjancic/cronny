import {
  getJob,
  getJobRuns,
  getLastRun,
  getRun,
  getSchedule,
} from "./db/schema";
import "./instrument";
import express, { Request, Response } from "express";
import { scheduleRuns } from "./schedule";

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.get("/", (_: Request, res: Response) => {
  res.send("Hello, world!");
});

app.get("/api/jobs", (_: Request, res: Response) => {
  res.json(getSchedule());
});

app.get("/api/jobs/:id", async (req: Request, res: Response) => {
  const job = await getJob(req.params.id);
  res.json(job);
});

app.get("/api/jobs/:jobId/runs", async (req: Request, res: Response) => {
  const runs = await getJobRuns(req.params.jobId);
  res.json(runs);
});

app.get("/api/jobs/:jobId/runs/:runId", async (req: Request, res: Response) => {
  if (req.params.runId === "latest") {
    const run = await getLastRun(req.params.jobId);
    res.json(run);
    return;
  }
  const run = await getRun(+req.params.jobId);

  res.json(run);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

scheduleRuns();
