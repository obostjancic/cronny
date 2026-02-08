// import * as Sentry from "@sentry/node";
import type { Job, Runner } from "@cronny/types";
import { CronJob } from "cron";
import { executeRun } from "./run.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("cron");

export function cron(job: Job, runner: Runner): CronJob {
  // const CronJobWithCheckIn = Sentry.cron.instrumentCron(CronJob, config.id);
  const CronJobWithCheckIn = CronJob;

  return CronJobWithCheckIn.from({
    cronTime: job.cron,
    onTick: function () {
      executeRun(job, runner).catch((error) => {
        logger.error(`Unhandled error in cron job ${job.name}: ${error}`);
      });
    },
    start: true,
  });
}
