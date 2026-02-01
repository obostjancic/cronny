import { STRATEGY_SCHEMAS } from "@cronny/types";
import { Hono } from "hono";

export const strategiesRoutes = new Hono();

strategiesRoutes.get("/", async (c) => {
  return c.json(STRATEGY_SCHEMAS);
});

strategiesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const schema = STRATEGY_SCHEMAS.find((s) => s.id === id);

  if (!schema) {
    return c.json({ error: "Strategy not found" }, 404);
  }

  return c.json(schema);
});
