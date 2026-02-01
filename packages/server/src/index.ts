import "./instrument.js";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.js";
import { clientRoutes } from "./routes/clients.js";
import { jobsRoutes } from "./routes/jobs.js";
import { publicRoutes } from "./routes/public.js";
import { resultRoutes } from "./routes/results.js";
import { strategiesRoutes } from "./routes/strategies.js";
import { scheduleRuns } from "./schedule.js";
import { getEnv } from "./utils/env.js";

const app = new Hono();

// CORS Middleware
app.use("*", async (c, next) => {
  // Set CORS headers
  c.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  c.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  ); // Allowed methods
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key",
  ); // Allowed headers

  // Handle preflight requests
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  return next(); // Proceed to the next middleware or route handler
});

app.route("/api/public", publicRoutes);

app.use("/api/*", authMiddleware);

app.route("/api/auth", authRoutes);
app.route("/api/jobs", jobsRoutes);
app.route("/api/results", resultRoutes);
app.route("/api/clients", clientRoutes);
app.route("/api/strategies", strategiesRoutes);

const port = getEnv("PORT") || 3000;
console.log(`Server is running on port ${port}`);

// Serve static files if client dist exists
const clientDistPath = "../client/dist";
if (fs.existsSync(clientDistPath)) {
  const indexHtml = fs.readFileSync(`${clientDistPath}/index.html`, "utf-8");
  app.use(
    serveStatic({
      root: clientDistPath,
      index: "index.html",
    }),
  );
  app.get("*", (c) => {
    return c.html(indexHtml);
  });
}

serve({
  port: Number(port),
  fetch: app.fetch,
});
scheduleRuns();
