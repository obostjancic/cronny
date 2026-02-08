import { Result } from "@cronny/types";
import { Hono } from "hono";
import { updateResult } from "../db/result.js";

export const resultRoutes = new Hono();

resultRoutes.patch("/:id", async (c) => {
  const resultId = Number(c.req.param("id"));
  if (!Number.isInteger(resultId) || resultId <= 0) {
    return c.json({ error: "Invalid result ID" }, 400);
  }

  const patch = await c.req.json<Partial<Result>>();
  const result = await updateResult(resultId, patch);

  return c.json(result);
});
