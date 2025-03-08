import { Hono } from "hono";
import { getJobResults } from "../db/result.js";
import { clientAuthMiddleware } from "../middleware/clientAuth.js";

const publicRoutes = new Hono();

publicRoutes.use("*", clientAuthMiddleware);

publicRoutes.get("/results", async (c) => {
  const client = c.get("client");

  const res = await Promise.all(
    client.allowedJobs?.map(async (jobId) => {
      return await getJobResults(jobId);
    }) ?? []
  );

  return c.json(res);
});

export { publicRoutes };
