"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleRuns = scheduleRuns;
const logger_1 = __importDefault(require("./utils/logger"));
const cron_1 = require("./cron");
const run_1 = require("./run");
const schema_1 = require("./db/schema");
function scheduleRun(config, runner) {
    if (config.cron) {
        (0, cron_1.cron)(config, runner);
    }
    else {
        setInterval(() => (0, run_1.executeRun)(config, runner), config.interval);
    }
}
async function scheduleRuns() {
    const schedule = await (0, schema_1.getSchedule)();
    for (const config of schedule) {
        if (!config.enabled) {
            logger_1.default.debug(`Skipping ${config.jobId} - disabled`);
            continue;
        }
        logger_1.default.debug(`Scheduling ${config.jobId}`);
        const strategyModule = await import(`./strategies/${config.strategy}.js`);
        if (strategyModule && strategyModule.run) {
            scheduleRun(config, strategyModule.run);
        }
    }
}
