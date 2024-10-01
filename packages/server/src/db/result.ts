import { Result, UnsavedResult } from "@cronny/types";
import { and, eq, ne } from "drizzle-orm";
import { db, Results } from "./schema.js";

const iso = () => new Date().toISOString();

export async function getJobResults(jobId: number): Promise<Result[]> {
  return db.select().from(Results).where(eq(Results.jobId, jobId));
}

export async function getNonExpiredResults(jobId: number): Promise<Result[]> {
  return db
    .select()
    .from(Results)
    .where(and(eq(Results.jobId, jobId), ne(Results.status, "expired")));
}

export async function saveResult(result: UnsavedResult): Promise<Result> {
  const savedResults = await db
    .insert(Results)
    .values({ ...result, updatedAt: iso(), createdAt: iso() })
    .returning();

  return savedResults[0];
}

export async function updateResult(
  id: number,
  result: Partial<UnsavedResult>
): Promise<Result> {
  const updateResults = await db
    .update(Results)
    .set({ ...result, updatedAt: iso() })
    .where(eq(Results.id, id))
    .returning();

  return updateResults[0];
}

export async function upsertResult(
  result: UnsavedResult | Result
): Promise<Result> {
  if ("id" in result) {
    return updateResult(result.id, result);
  } else {
    return saveResult(result);
  }
}

export async function upsertResults(
  newResults: UnsavedResult[]
): Promise<Result[]> {
  return Promise.all(newResults.map(upsertResult));
}
