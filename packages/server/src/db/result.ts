import { Result, UnsavedResult } from "@cronny/types";
import { and, eq, ne } from "drizzle-orm";
import { db, results } from "./schema.js";
import { iso } from "../utils/date.js";

export async function getJobResults(jobId: number): Promise<Result[]> {
  return db.select().from(results).where(eq(results.jobId, jobId));
}

export async function getNonExpiredResults(jobId: number): Promise<Result[]> {
  return db
    .select()
    .from(results)
    .where(and(eq(results.jobId, jobId), ne(results.status, "expired")));
}

export async function saveResult(result: UnsavedResult): Promise<Result> {
  const savedResults = await db
    .insert(results)
    .values({ ...result, updatedAt: iso() })
    .returning();

  return savedResults[0];
}

export async function updateResult(
  id: number,
  result: Partial<UnsavedResult>
): Promise<Result> {
  const updateResults = await db
    .update(results)
    .set({ ...result, updatedAt: iso() })
    .where(eq(results.id, id))
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
