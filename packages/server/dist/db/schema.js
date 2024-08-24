import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { desc, eq } from "drizzle-orm";
import path from "path";
import { promises as fs } from "fs";
export const dataDirPath = "./.data";
const sqlite = new Database(path.join(dataDirPath, "sqlite.db"));
export const db = drizzle(sqlite);
export const runs = sqliteTable("runs", {
    id: integer("id").primaryKey().notNull(),
    jobId: text("jobId").notNull(),
    start: text("start").notNull(),
    end: text("end"),
    status: text("status").notNull().$type(),
    config: blob("config", { mode: "json" }).notNull().$type(),
    results: blob("results", { mode: "json" }).$type(),
});
export async function getRun(id) {
    const savedRuns = await db.select().from(runs).where(eq(runs.id, id));
    return savedRuns[0];
}
export async function saveRun(run) {
    const savedRuns = await db.insert(runs).values(run).returning();
    return savedRuns[0];
}
export async function updateRun(id, run) {
    const updatedRuns = await db
        .update(runs)
        .set(run)
        .where(eq(runs.id, id))
        .returning();
    return updatedRuns[0];
}
export async function getJobRuns(jobId) {
    return db.select().from(runs).where(eq(runs.jobId, jobId));
}
export async function getLastRun(jobId) {
    const savedRuns = await db
        .select()
        .from(runs)
        .where(eq(runs.jobId, jobId))
        .orderBy(desc(runs.start))
        .limit(1);
    return savedRuns[0];
}
export async function getPreviousRun(runId) {
    const savedRuns = await db
        .select()
        .from(runs)
        .where(eq(runs.jobId, runId))
        .orderBy(desc(runs.start))
        .limit(2);
    return savedRuns[1];
}
export async function getSchedule() {
    const schedulePath = path.join(dataDirPath, "schedule.json");
    const schedule = await fs.readFile(schedulePath, "utf-8");
    return JSON.parse(schedule);
}
export async function getJob(name) {
    const schedule = await getSchedule();
    return schedule.find((job) => job.name === name);
}
