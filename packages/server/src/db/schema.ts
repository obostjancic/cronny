import type { JSONObject, Notify } from "@cronny/types";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  blob,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path relative to the server package root
export const dataDirPath = path.join(__dirname, "../../.data");

const dbPath = process.env.DATABASE_PATH || path.join(dataDirPath, "db.sqlite");

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite);

export const Jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey().notNull(),
  strategy: text("strategy").notNull(),
  name: text("name").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  cron: text("cron").notNull(),
  params: blob("params", { mode: "json" }).$type<JSONObject>(),
  notify: blob("notify", { mode: "json" }).$type<Notify>(),
});

export const Runs = sqliteTable(
  "runs",
  {
    id: integer("id").primaryKey().notNull(),
    jobId: integer("jobId")
      .references(() => Jobs.id, { onDelete: "cascade" })
      .notNull(),
    start: text("start").notNull(),
    end: text("end"),
    status: text("status").notNull().$type<"running" | "success" | "failure">(),
  },
  (table) => ({
    jobIdIdx: index("runs_job_id_idx").on(table.jobId),
  }),
);

export const Results = sqliteTable(
  "results",
  {
    id: integer("id").primaryKey().notNull(),
    createdAt: text("createdAt").notNull().default("1970-01-01T00:00:00.000Z"),
    updatedAt: text("updatedAt").notNull().default("1970-01-01T00:00:00.000Z"),
    internalId: text("internalId").notNull(),
    runId: integer("runId")
      .references(() => Runs.id, { onDelete: "cascade" })
      .notNull(),
    jobId: integer("jobId")
      .references(() => Jobs.id, { onDelete: "cascade" })
      .notNull(),
    data: blob("data", { mode: "json" }).notNull().$type<JSONObject>(),
    status: text("status").notNull().$type<"active" | "expired" | "filtered">(),
    isHidden: integer("isHidden", { mode: "boolean" }).notNull().default(false),
  },
  (table) => ({
    jobIdIdx: index("results_job_id_idx").on(table.jobId),
    internalIdIdx: index("results_internal_id_idx").on(table.jobId, table.internalId),
  }),
);

export const Clients = sqliteTable("clients", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  apiKey: text("apiKey").notNull().unique(),
  createdAt: text("createdAt").notNull().default("1970-01-01T00:00:00.000Z"),
  updatedAt: text("updatedAt").notNull().default("1970-01-01T00:00:00.000Z"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

export const ClientJobs = sqliteTable(
  "client_jobs",
  {
    clientId: integer("clientId")
      .references(() => Clients.id, { onDelete: "cascade" })
      .notNull(),
    jobId: integer("jobId")
      .references(() => Jobs.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: text("createdAt").notNull().default("1970-01-01T00:00:00.000Z"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.clientId, table.jobId] }),
    clientIdIdx: index("client_jobs_client_id_idx").on(table.clientId),
  }),
);
