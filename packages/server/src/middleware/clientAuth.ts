import { Context, Next } from "hono";
import { findClientByApiKey } from "../db/client.js";

export async function clientAuthMiddleware(c: Context, next: Next) {
  const apiKey = c.req.header("X-API-Key");

  if (!apiKey) {
    return c.json({ error: "Missing API key" }, 401);
  }

  const client = await findClientByApiKey(apiKey);

  if (!client) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  c.set("client", client);

  return next();
}
