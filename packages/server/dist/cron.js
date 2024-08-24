"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cron = cron;
// import * as Sentry from "@sentry/node";
const cron_1 = require("cron");
const run_1 = require("./run");
function cron(config, runner) {
    if (!config.cron) {
        throw new Error("Cron job must have a cron property");
    }
    // const CronJobWithCheckIn = Sentry.cron.instrumentCron(CronJob, config.id);
    const CronJobWithCheckIn = cron_1.CronJob;
    return CronJobWithCheckIn.from({
        cronTime: config.cron,
        onTick: function () {
            (0, run_1.executeRun)(config, runner);
        },
        start: true,
    });
}
