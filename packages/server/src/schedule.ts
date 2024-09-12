import { CronJob } from "cron";
import { cron } from "./cron.js";
import { getJobs } from "./db/job.js";
import logger from "./utils/logger.js";

let schedule: CronJob[] = [];

export async function scheduleRuns(): Promise<void> {
  const jobs = await getJobs();

  for (const job of jobs) {
    if (!job.enabled) {
      logger.debug(`Skipping ${job.name} - disabled`);
      continue;
    }
    logger.debug(`Scheduling ${job.name}`);
    const strategyModule = await import(`./strategies/${job.strategy}.js`);

    if (strategyModule && strategyModule.run) {
      schedule.push(cron(job, strategyModule.run));
    }
  }
}

function stopRuns(): void {
  logger.debug("Stopping all scheduled jobs");
  schedule.forEach((job) => {
    job.stop();
  });
  schedule = [];
}

export function invalidateSchedule(): void {
  stopRuns();
  scheduleRuns();
}
