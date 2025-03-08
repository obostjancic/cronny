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
import { scheduleRuns } from "./schedule.js";
import { isProd } from "./utils/env.js";

const app = new Hono();

// CORS Middleware
app.use("*", async (c, next) => {
  // Set CORS headers
  c.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allowed methods
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key"
  ); // Allowed headers

  // Handle preflight requests
  if (c.req.method === "OPTIONS") {
    return Promise.resolve(c.text("OK", 204)); // Respond with 204 No Content for preflight
  }

  return next(); // Proceed to the next middleware or route handler
});

app.route("/api/public", publicRoutes);

app.use("/api/*", authMiddleware);

app.route("/api/auth", authRoutes);
app.route("/api/jobs", jobsRoutes);
app.route("/api/results", resultRoutes);
app.route("/api/clients", clientRoutes);

const port = 3000;
console.log(`Server is running on port ${port}`);

if (isProd) {
  const indexHtml = fs.readFileSync("../client/dist/index.html", "utf-8");
  app.use(
    serveStatic({
      root: "../client/dist",
      index: "index.html",
    })
  );
  app.get("*", (c) => {
    return c.html(indexHtml);
  });
} else {
  app.use("*", (c) => {
    return fetch(`http://localhost:5173${c.req.path}`);
  });
}

serve({
  port,
  fetch: app.fetch,
});
scheduleRuns();
