import { Result } from "@cronny/types";
import { Hono } from "hono";
import { updateResult } from "../db/result.js";

export const resultRoutes = new Hono();

resultRoutes.patch("/:id", async (c) => {
  const { id, ...patch } = await c.req.json<Partial<Result>>();
  const resultId = Number(c.req.param("id") ?? id);
  const result = await updateResult(resultId, patch);

  return c.json(result);
});
