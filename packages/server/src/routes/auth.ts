import { Hono } from "hono";
import { sign } from "hono/jwt";
import { getEnv } from "../utils/env.js";

const authRoutes = new Hono();

authRoutes.post("/login", async (c) => {
  const { password } = await c.req.json();

  if (password !== getEnv("API_PASSWORD")) {
    return c.json({ error: "Invalid password" }, 401);
  }

  const token = await sign({ authenticated: true }, getEnv("API_SECRET"));
  return c.json({ token });
});

export { authRoutes };
