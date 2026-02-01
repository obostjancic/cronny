import { Run, UnsavedRun } from "@cronny/types";
import { desc, eq } from "drizzle-orm";
import { db, Runs } from "./schema.js";

export async function getRun(id: number): Promise<Run | undefined> {
  const savedRuns = await db.select().from(Runs).where(eq(Runs.id, id));

  return savedRuns[0];
}

export async function saveRun(run: UnsavedRun): Promise<Run> {
  const savedRuns = await db.insert(Runs).values(run).returning();

  return savedRuns[0];
}

export async function updateRun(
  id: number,
  run: Partial<UnsavedRun>
): Promise<Run> {
  const updatedRuns = await db
    .update(Runs)
    .set(run)
    .where(eq(Runs.id, id))
    .returning();

  return updatedRuns[0];
}

export async function getJobRuns(jobId: number): Promise<Run[]> {
  return db
    .select()
    .from(Runs)
    .where(eq(Runs.jobId, jobId))
    .orderBy(desc(Runs.start))
    .limit(100);
}

export async function getLastRun(jobId: number): Promise<Run | undefined> {
  const savedRuns = await db
    .select()
    .from(Runs)
    .where(eq(Runs.jobId, jobId))
    .orderBy(desc(Runs.start))
    .limit(1);

  return savedRuns[0];
}

export async function getPreviousRun(runId: number): Promise<Run | undefined> {
  const savedRuns = await db
    .select()
    .from(Runs)
    .where(eq(Runs.jobId, runId))
    .orderBy(desc(Runs.start))
    .limit(2);

  return savedRuns[1];
}

export async function deleteJobRuns(jobId: number): Promise<void> {
  await db.delete(Runs).where(eq(Runs.jobId, jobId));
}
