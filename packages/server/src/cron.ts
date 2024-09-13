// import * as Sentry from "@sentry/node";
import { CronJob } from "cron";
import { executeRun } from "./run.js";
import type { Job, Runner } from "@cronny/types";

export function cron(job: Job, runner: Runner): CronJob {
  // const CronJobWithCheckIn = Sentry.cron.instrumentCron(CronJob, config.id);
  const CronJobWithCheckIn = CronJob;

  return CronJobWithCheckIn.from({
    cronTime: job.cron,
    onTick: function () {
      executeRun(job, runner);
    },
    start: true,
  });
}
