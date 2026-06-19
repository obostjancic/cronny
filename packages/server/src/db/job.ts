import type { Job, UnsavedJob } from "@cronny/types";
import { eq } from "drizzle-orm";
import { normalizeJobParams } from "../utils/model.js";
import { db, Jobs } from "./schema.js";

export async function getJobs(): Promise<Job[]> {
  const jobs = await db.select().from(Jobs);

  return jobs.map(normalizeJob);
}

export async function getJob(id: number): Promise<Job | undefined> {
  const savedJobs = await db.select().from(Jobs).where(eq(Jobs.id, id));
  const job = savedJobs[0];

  return job ? normalizeJob(job) : undefined;
}

export async function saveJob(job: UnsavedJob): Promise<Job> {
  const normalizedJob = normalizeJob(job);
  const savedJobs = await db.insert(Jobs).values(normalizedJob).returning();

  return normalizeJob(savedJobs[0]);
}

export async function updateJob(
  id: number,
  job: Partial<UnsavedJob>
): Promise<Job> {
  const normalizedJob = normalizePartialJob(job);
  const updatedJobs = await db
    .update(Jobs)
    .set(normalizedJob)
    .where(eq(Jobs.id, id))
    .returning();

  return normalizeJob(updatedJobs[0]);
}

export async function deleteJob(id: number): Promise<void> {
  await db.delete(Jobs).where(eq(Jobs.id, id));
}

function normalizeJob<T extends Job | UnsavedJob>(job: T): T {
  return {
    ...job,
    params: normalizeJobParams(job.params),
  };
}

function normalizePartialJob(job: Partial<UnsavedJob>): Partial<UnsavedJob> {
  if (!("params" in job)) {
    return job;
  }

  return {
    ...job,
    params: normalizeJobParams(job.params ?? null),
  };
}
