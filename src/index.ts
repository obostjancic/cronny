import "./instrument";
import { getSchedule, scheduleRuns } from "./schedule";
import * as db from "./db";
import express, { Request, Response } from "express";

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
  const job = await db.getJob(req.params.id);
  res.json(job);
});

app.get("/api/jobs/:jobId/runs", async (req: Request, res: Response) => {
  const job = await db.getJob(req.params.jobId);
  res.json(job.runs);
});

app.get("/api/jobs/:jobId/runs/:runId", async (req: Request, res: Response) => {
  if (req.params.runId === "latest") {
    const run = await db.getLastRun(req.params.jobId);
    res.json(run);
    return;
  }
  const runs = await db.getJob(req.params.jobId);
  const run = runs.runs.find((r) => r.id === req.params.runId);
  
  res.json(run);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

scheduleRuns();
