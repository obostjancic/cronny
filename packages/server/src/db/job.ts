import type { Job, UnsavedJob } from "@cronny/types";
import { eq } from "drizzle-orm";
import { db, jobs } from "./schema.js";

export async function getJobs(): Promise<Job[]> {
  return db.select().from(jobs);
}

export async function getJob(id: number): Promise<Job | undefined> {
  const savedJobs = await db.select().from(jobs).where(eq(jobs.id, id));

  return savedJobs[0];
}

export async function saveJob(job: UnsavedJob): Promise<Job> {
  const savedJobs = await db.insert(jobs).values(job).returning();

  return savedJobs[0];
}

export async function updateJob(
  id: number,
  job: Partial<UnsavedJob>
): Promise<any> {
  const updatedJobs = await db
    .update(jobs)
    .set(job)
    .where(eq(jobs.id, id))
    .returning();

  return updatedJobs[0];
}
