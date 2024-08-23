import * as Sentry from "@sentry/node";
import { CronJob } from "cron";
import { executeRun } from "./run";
import { JobConfig, Runner } from "./types";

export function cron(config: JobConfig, runner: Runner): CronJob {
  if (!config.cron) {
    throw new Error("Cron job must have a cron property");
  }

  // const CronJobWithCheckIn = Sentry.cron.instrumentCron(CronJob, config.id);
  const CronJobWithCheckIn = CronJob;

  return CronJobWithCheckIn.from({
    cronTime: config.cron,
    onTick: function () {
      executeRun(config, runner);
    },
    start: true,
  });
}
