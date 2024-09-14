import { CronJob } from "cron";
import { cron } from "./cron.js";
import { getJobs } from "./db/job.js";
import type { Job, Runner } from "@cronny/types";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("schedule");

let schedule: CronJob[] = [];

export async function scheduleRuns(): Promise<void> {
  const jobs = await getJobs();

  for (const job of jobs) {
    if (!job.enabled) {
      logger.debug(`Skipping ${job.name} - disabled`);
      continue;
    }
    logger.debug(`Scheduling ${job.name}`);
    const runner = await getRunner(job);

    schedule.push(cron(job, runner));
  }
}

export async function getRunner(job: Job): Promise<Runner> {
  const strategyModule = await import(`./strategies/${job.strategy}.js`);

  if (strategyModule && strategyModule.run) {
    return strategyModule.run;
  }

  throw new Error(`Strategy ${job.strategy} not found`);
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
