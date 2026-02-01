import type { Job, UnsavedJob } from "@cronny/types";
import { eq } from "drizzle-orm";
import { db, Jobs } from "./schema.js";

export async function getJobs(): Promise<Job[]> {
  return db.select().from(Jobs);
}

export async function getJob(id: number): Promise<Job | undefined> {
  const savedJobs = await db.select().from(Jobs).where(eq(Jobs.id, id));

  return savedJobs[0];
}

export async function saveJob(job: UnsavedJob): Promise<Job> {
  const savedJobs = await db.insert(Jobs).values(job).returning();

  return savedJobs[0];
}

export async function updateJob(
  id: number,
  job: Partial<UnsavedJob>
): Promise<any> {
  const updatedJobs = await db
    .update(Jobs)
    .set(job)
    .where(eq(Jobs.id, id))
    .returning();

  return updatedJobs[0];
}

export async function deleteJob(id: number): Promise<void> {
  await db.delete(Jobs).where(eq(Jobs.id, id));
}
