"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRun = executeRun;
const schema_1 = require("./db/schema");
const notify_1 = require("./notification/notify");
const date_1 = require("./utils/date");
const logger_1 = __importDefault(require("./utils/logger"));
async function executeRun(config, runner) {
    let run = await startRun(config);
    let results = null;
    try {
        results = await runner(run.config.params);
    }
    catch (e) {
        logger_1.default.error(`Error running job ${run.config.name}`, e);
        run.results = null;
    }
    finally {
        run = await finishRun(run.id, results);
    }
    (0, notify_1.notifyRun)(run);
}
async function startRun(config) {
    logger_1.default.debug(`Starting run for ${config.name}`);
    return (0, schema_1.saveRun)({
        jobId: config.jobId,
        start: (0, date_1.iso)(),
        end: null,
        status: "running",
        results: null,
        config: config,
    });
}
async function finishRun(runId, results) {
    const isSuccess = !!results;
    const savedRun = await (0, schema_1.updateRun)(runId, {
        end: (0, date_1.iso)(),
        results: results,
        status: isSuccess ? "success" : "failure",
    });
    return savedRun;
}
