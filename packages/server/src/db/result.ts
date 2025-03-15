import { Result, UnsavedResult } from "@cronny/types";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { iso } from "../utils/date.js";
import { db, Results } from "./schema.js";

export async function getJobResults(
  jobId: number,
  options: {
    page?: number;
    limit?: number;
    orderBy?: keyof Result;
    order?: "asc" | "desc";
  } = {}
): Promise<Result[]> {
  const {
    page = 1,
    limit = 50,
    orderBy = "createdAt",
    order = "desc",
  } = options;

  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from(Results)
    .where(eq(Results.jobId, jobId))
    .orderBy(order === "asc" ? asc(Results[orderBy]) : desc(Results[orderBy]))
    .limit(limit)
    .offset(offset);

  return results;
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

export async function deleteJobResults(jobId: number): Promise<void> {
  await db.delete(Results).where(eq(Results.jobId, jobId));
}
