"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runs = exports.db = exports.dataDirPath = void 0;
exports.getRun = getRun;
exports.saveRun = saveRun;
exports.updateRun = updateRun;
exports.getJobRuns = getJobRuns;
exports.getLastRun = getLastRun;
exports.getPreviousRun = getPreviousRun;
exports.getSchedule = getSchedule;
exports.getJob = getJob;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
exports.dataDirPath = "./.data";
const sqlite = new better_sqlite3_1.default(path_1.default.join(exports.dataDirPath, "sqlite.db"));
exports.db = (0, better_sqlite3_2.drizzle)(sqlite);
exports.runs = (0, sqlite_core_1.sqliteTable)("runs", {
    id: (0, sqlite_core_1.integer)("id").primaryKey().notNull(),
    jobId: (0, sqlite_core_1.text)("jobId").notNull(),
    start: (0, sqlite_core_1.text)("start").notNull(),
    end: (0, sqlite_core_1.text)("end"),
    status: (0, sqlite_core_1.text)("status").notNull().$type(),
    config: (0, sqlite_core_1.blob)("config", { mode: "json" }).notNull().$type(),
    results: (0, sqlite_core_1.blob)("results", { mode: "json" }).$type(),
});
async function getRun(id) {
    const savedRuns = await exports.db.select().from(exports.runs).where((0, drizzle_orm_1.eq)(exports.runs.id, id));
    return savedRuns[0];
}
async function saveRun(run) {
    const savedRuns = await exports.db.insert(exports.runs).values(run).returning();
    return savedRuns[0];
}
async function updateRun(id, run) {
    const updatedRuns = await exports.db
        .update(exports.runs)
        .set(run)
        .where((0, drizzle_orm_1.eq)(exports.runs.id, id))
        .returning();
    return updatedRuns[0];
}
async function getJobRuns(jobId) {
    return exports.db.select().from(exports.runs).where((0, drizzle_orm_1.eq)(exports.runs.jobId, jobId));
}
async function getLastRun(jobId) {
    const savedRuns = await exports.db
        .select()
        .from(exports.runs)
        .where((0, drizzle_orm_1.eq)(exports.runs.jobId, jobId))
        .orderBy((0, drizzle_orm_1.desc)(exports.runs.start))
        .limit(1);
    return savedRuns[0];
}
async function getPreviousRun(runId) {
    const savedRuns = await exports.db
        .select()
        .from(exports.runs)
        .where((0, drizzle_orm_1.eq)(exports.runs.jobId, runId))
        .orderBy((0, drizzle_orm_1.desc)(exports.runs.start))
        .limit(2);
    return savedRuns[1];
}
async function getSchedule() {
    const schedulePath = path_1.default.join(exports.dataDirPath, "schedule.json");
    const schedule = await fs_1.promises.readFile(schedulePath, "utf-8");
    return JSON.parse(schedule);
}
async function getJob(name) {
    const schedule = await getSchedule();
    return schedule.find((job) => job.name === name);
}
