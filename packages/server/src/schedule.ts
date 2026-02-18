import type { Job, Runner } from "@cronny/types";
import { CronJob } from "cron";
import { cron } from "./cron.js";
import { getJobs } from "./db/job.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("schedule");

let schedule: CronJob[] = [];

export async function scheduleRuns(): Promise<void> {
  const jobs = await getJobs();

  for (const job of jobs) {
    if (!job.enabled) {
      logger.info(`Skipping ${job.name} - disabled`);
      continue;
    }
    logger.info(`Scheduling ${job.name}`);
    try {
      const runner = await getRunner(job);

      schedule.push(cron(job, runner));
    } catch (error) {
      logger.error(`Failed to schedule ${job.name}: ${error}`);
    }
  }
}

export async function getRunner(job: Job): Promise<Runner> {
  const strategyModule = await import(`./strategies/${job.strategy}.js`);

  if (strategyModule && strategyModule.run) {
    return strategyModule.run;
  }

  throw new Error(`Strategy ${job.strategy} not found`);
}

export function stopRuns(): void {
  logger.info("Stopping all scheduled jobs");
  schedule.forEach((job) => {
    job.stop();
  });
  schedule = [];
}

export async function invalidateSchedule(): Promise<void> {
  stopRuns();
  await scheduleRuns();
}
