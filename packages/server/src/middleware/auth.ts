import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { PUBLIC_PATHS } from "../constants.js";
import { getEnv } from "../utils/env.js";

export async function authMiddleware(c: Context, next: Next) {
  if (c.req.method === "OPTIONS") {
    return next();
  }

  if (PUBLIC_PATHS.some((path) => c.req.path.startsWith(path))) {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    await verify(token, getEnv("API_SECRET"), "HS256");
    return next();
  } catch (e) {
    return c.json({ error: "Invalid token" }, 401);
  }
}
