import { cron } from "./cron.js";
import { getJobs } from "./db/job.js";
import logger from "./utils/logger.js";

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
      cron(job, strategyModule.run);
    }
  }
}
