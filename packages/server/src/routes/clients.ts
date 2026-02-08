import { Hono } from "hono";
import {
  createClient,
  findAllClients,
  findClientById,
  updateClient,
} from "../db/client.js";

const clientRoutes = new Hono();

clientRoutes.get("/", async (c) => {
  const clients = await findAllClients();
  return c.json(clients);
});

clientRoutes.post("/", async (c) => {
  const { name, allowedJobs } = await c.req.json();
  if (!name || typeof name !== "string") {
    return c.json({ error: "Name is required" }, 400);
  }
  const client = await createClient({ name, allowedJobs });
  return c.json(client);
});

clientRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "Invalid client ID" }, 400);
  }

  const client = await findClientById(id);
  if (!client) {
    return c.json({ error: "Client not found" }, 404);
  }

  return c.json(client);
});

clientRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "Invalid client ID" }, 400);
  }

  const { name, allowedJobs } = await c.req.json();
  const client = await updateClient(id, { name, allowedJobs });
  return c.json(client);
});

export { clientRoutes };
