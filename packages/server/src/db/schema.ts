import type { JSONObject, Notify } from "@cronny/types";
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import path from "path";

export const dataDirPath = "./.data";

const sqlite = new Database(path.join(dataDirPath, "sqlite.db"));
export const db = drizzle(sqlite);

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey().notNull(),
  strategy: text("strategy").notNull(),
  name: text("name").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  cron: text("cron").notNull(),
  params: blob("params", { mode: "json" }).$type<JSONObject>(),
  notify: blob("notify", { mode: "json" }).$type<Notify>(),
});

export const runs = sqliteTable("runs", {
  id: integer("id").primaryKey().notNull(),
  jobId: integer("jobId")
    .references(() => jobs.id)
    .notNull(),
  start: text("start").notNull(),
  end: text("end"),
  status: text("status").notNull().$type<"running" | "success" | "failure">(),
});

export const results = sqliteTable("results", {
  id: integer("id").primaryKey().notNull(),
  updatedAt: text("updatedAt").notNull().default("1970-01-01T00:00:00.000Z"),
  internalId: text("internalId").notNull(),
  runId: integer("runId")
    .references(() => runs.id)
    .notNull(),
  jobId: integer("jobId")
    .references(() => jobs.id)
    .notNull(),
  data: blob("data", { mode: "json" }).notNull().$type<JSONObject>(),
  status: text("status")
    .notNull()
    .$type<"active" | "expired" | "filtered" | "hidden">(),
});
