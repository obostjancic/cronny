import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ClientJobs, Clients, db } from "./schema.js";

export interface CreateClientInput {
  name: string;
  allowedJobs: number[];
}

export interface UpdateClientInput {
  name: string;
  allowedJobs: number[];
}

export interface ClientWithJobs {
  id: number;
  name: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  allowedJobs: number[];
}

async function attachJobsToClient(
  client: typeof Clients.$inferSelect
): Promise<ClientWithJobs> {
  const jobs = await db
    .select({ jobId: ClientJobs.jobId })
    .from(ClientJobs)
    .where(eq(ClientJobs.clientId, client.id));

  return {
    ...client,
    allowedJobs: jobs.map((j) => j.jobId),
  };
}

async function attachJobsToClients(
  clients: (typeof Clients.$inferSelect)[]
): Promise<ClientWithJobs[]> {
  return Promise.all(clients.map(attachJobsToClient));
}

export async function createClient(input: CreateClientInput) {
  const data = {
    name: input.name,
    apiKey: `neep_${nanoid(32)}`,
  };

  const result = await db.transaction(async (tx) => {
    const [insertedClient] = await tx.insert(Clients).values(data).returning();

    if (input.allowedJobs.length > 0) {
      await tx.insert(ClientJobs).values(
        input.allowedJobs.map((jobId) => ({
          clientId: insertedClient.id,
          jobId,
        }))
      );
    }

    return insertedClient;
  });

  return attachJobsToClient(result);
}

export async function findAllClients() {
  const clients = await db.select().from(Clients);
  return attachJobsToClients(clients);
}

export async function findClientById(id: number) {
  const client = await db
    .select()
    .from(Clients)
    .where(eq(Clients.id, id))
    .get();
  if (!client) return undefined;
  return attachJobsToClient(client);
}

export async function findClientByApiKey(apiKey: string) {
  const client = await db
    .select()
    .from(Clients)
    .where(eq(Clients.apiKey, apiKey))
    .get();
  if (!client) return undefined;
  return attachJobsToClient(client);
}

export async function updateClient(id: number, input: UpdateClientInput) {
  await db.transaction(async (tx) => {
    await tx
      .update(Clients)
      .set({
        name: input.name,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(Clients.id, id));
    const existingJobs = await tx
      .select({ jobId: ClientJobs.jobId })
      .from(ClientJobs)
      .where(eq(ClientJobs.clientId, id));

    const existingJobIds = existingJobs.map((j) => j.jobId);
    const jobsToAdd = input.allowedJobs.filter(
      (id) => !existingJobIds.includes(id)
    );
    const jobsToRemove = existingJobIds.filter(
      (id) => !input.allowedJobs.includes(id)
    );

    if (jobsToRemove.length > 0) {
      await tx
        .delete(ClientJobs)
        .where(
          and(
            eq(ClientJobs.clientId, id),
            inArray(ClientJobs.jobId, jobsToRemove)
          )
        );
    }

    if (jobsToAdd.length > 0) {
      await tx.insert(ClientJobs).values(
        jobsToAdd.map((jobId) => ({
          clientId: id,
          jobId,
          createdAt: new Date().toISOString(),
        }))
      );
    }
  });

  return findClientById(id);
}

export async function findAllowedJobsForClient(clientId: number) {
  return db
    .select({ jobId: ClientJobs.jobId })
    .from(ClientJobs)
    .where(eq(ClientJobs.clientId, clientId));
}

export async function isJobAllowedForClient(clientId: number, jobId: number) {
  const result = await db
    .select()
    .from(ClientJobs)
    .where(and(eq(ClientJobs.clientId, clientId), eq(ClientJobs.jobId, jobId)))
    .get();

  return result !== undefined;
}
