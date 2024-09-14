import { Run, UnsavedRun } from "@cronny/types";
import { desc, eq } from "drizzle-orm";
import { db, runs } from "./schema.js";

export async function getRun(id: number): Promise<Run | undefined> {
  const savedRuns = await db.select().from(runs).where(eq(runs.id, id));

  return savedRuns[0];
}

export async function saveRun(run: UnsavedRun): Promise<Run> {
  const savedRuns = await db.insert(runs).values(run).returning();

  return savedRuns[0];
}

export async function updateRun(
  id: number,
  run: Partial<UnsavedRun>
): Promise<Run> {
  const updatedRuns = await db
    .update(runs)
    .set(run)
    .where(eq(runs.id, id))
    .returning();

  return updatedRuns[0];
}

export async function getJobRuns(jobId: number): Promise<Run[]> {
  return db
    .select()
    .from(runs)
    .where(eq(runs.jobId, jobId))
    .orderBy(desc(runs.start))
    .limit(100);
}

export async function getLastRun(jobId: number): Promise<Run | undefined> {
  const savedRuns = await db
    .select()
    .from(runs)
    .where(eq(runs.jobId, jobId))
    .orderBy(desc(runs.start))
    .limit(1);

  return savedRuns[0];
}

export async function getPreviousRun(runId: number): Promise<Run | undefined> {
  const savedRuns = await db
    .select()
    .from(runs)
    .where(eq(runs.jobId, runId))
    .orderBy(desc(runs.start))
    .limit(2);

  return savedRuns[1];
}
