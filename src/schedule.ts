import logger from "./utils/logger";
import { cron } from "./cron";
import { executeRun } from "./run";
import { JobConfig, Runner } from "./types";
import { getSchedule } from "./db/schema";

function scheduleRun(config: JobConfig, runner: Runner): void {
  if (config.cron) {
    cron(config, runner);
  } else {
    setInterval(() => executeRun(config, runner), config.interval);
  }
}

export async function scheduleRuns(): Promise<void> {
  const schedule = await getSchedule();

  for (const config of schedule) {
    if (!config.enabled) {
      logger.debug(`Skipping ${config.jobId} - disabled`);
      continue;
    }
    logger.debug(`Scheduling ${config.jobId}`);
    const strategyModule = await import(`./strategies/${config.strategy}`);

    if (strategyModule && strategyModule.run) {
      scheduleRun(config, strategyModule.run);
    }
  }
}
