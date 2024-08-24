import {
  getJob,
  getJobRuns,
  getLastRun,
  getRun,
  getSchedule,
} from "./db/schema.js";
import "./instrument.js";
import express, { Request, Response } from "express";
import { scheduleRuns } from "./schedule.js";
import proxy from "./middlewares/proxy.js";
import fs from "fs";
import { isProd } from "./utils/env.js";
import jobRoutes from "./routes/jobs.js";

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/jobs", jobRoutes);

if (isProd) {
  app.use(express.static("../web/dist"));
  const file = fs.readFileSync("../web/dist/index.html", "utf-8");
  app.get("*", (req, res) => {
    res.send(file);
  });
} else {
  console.log("Running in development mode");
  app.use("/", proxy);
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

scheduleRuns();
