import {
  JSONArray,
  JSONObject,
  JSONValue,
  NotificationConfig,
  Notify,
} from "@cronny/types";
import Database from "better-sqlite3";
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
  data: blob("data", { mode: "json" })
    .notNull()
    .$type<JSONObject[]>()
    .default([]),
  meta: blob("meta", { mode: "json" })
    .notNull()
    .$type<JSONObject>()
    .default({}),
});
