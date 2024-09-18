import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { jobsRoutes } from "./routes/jobs.js";
import { resultRoutes } from "./routes/results.js";
import { scheduleRuns } from "./schedule.js";
import { isProd } from "./utils/env.js";

const app = new Hono();

app.route("/api/jobs", jobsRoutes);
app.route("/api/results", resultRoutes);

const port = 3000;
console.log(`Server is running on port ${port}`);

if (isProd) {
  app.use("*", serveStatic({ root: "../client/dist" }));
} else {
  app.use("*", (c) => {
    return fetch(`http://localhost:5173${c.req.path}`);
  });
}

serve({
  fetch: app.fetch,
  port,
});
scheduleRuns();
