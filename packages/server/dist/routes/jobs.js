import { getJob, getJobRuns, getLastRun, getRun, getSchedule, } from "../db/schema.js";
import AsyncRouter from "./router.js";
const router = AsyncRouter();
router.get("/", async (_, res) => {
    const jobs = await getSchedule();
    res.json(jobs);
});
router.get("/:jobId", async (req, res) => {
    const job = await getJob(req.params.jobId);
    res.json(job);
});
router.get("/:jobId/runs", async (req, res) => {
    const runs = await getJobRuns(req.params.jobId);
    res.json(runs);
});
router.get("/:jobId/runs/:runId", async (req, res) => {
    if (req.params.runId === "latest") {
        const run = await getLastRun(req.params.jobId);
        res.json(run);
        return;
    }
    const run = await getRun(+req.params.jobId);
    res.json(run);
});
export default router;
