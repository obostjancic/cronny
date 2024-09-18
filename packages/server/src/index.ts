import "./instrument.js";
import express, { Request, Response } from "express";
import { scheduleRuns } from "./schedule.js";
import proxy from "./middlewares/proxy.js";
import fs from "fs";
import { isProd } from "./utils/env.js";
import jobRoutes from "./routes/jobs.js";
import resultRoutes from "./routes/results.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/results", resultRoutes);

if (isProd) {
  app.use(express.static("../client/dist"));
  const file = fs.readFileSync("../client/dist/index.html", "utf-8");
  app.get("*", (req, res) => {
    res.send(file);
  });
} else {
  app.use("/", proxy);
}

app.listen(port, () => {
  scheduleRuns();
});
