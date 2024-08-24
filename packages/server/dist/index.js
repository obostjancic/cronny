"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./db/schema");
require("./instrument");
const express_1 = __importDefault(require("express"));
const schedule_1 = require("./schedule");
const app = (0, express_1.default)();
const port = 3000;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Define routes
app.get("/", (_, res) => {
    res.send("Hello, world!");
});
app.get("/api/jobs", (_, res) => {
    res.json((0, schema_1.getSchedule)());
});
app.get("/api/jobs/:id", async (req, res) => {
    const job = await (0, schema_1.getJob)(req.params.id);
    res.json(job);
});
app.get("/api/jobs/:jobId/runs", async (req, res) => {
    const runs = await (0, schema_1.getJobRuns)(req.params.jobId);
    res.json(runs);
});
app.get("/api/jobs/:jobId/runs/:runId", async (req, res) => {
    if (req.params.runId === "latest") {
        const run = await (0, schema_1.getLastRun)(req.params.jobId);
        res.json(run);
        return;
    }
    const run = await (0, schema_1.getRun)(+req.params.jobId);
    res.json(run);
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
(0, schedule_1.scheduleRuns)();
