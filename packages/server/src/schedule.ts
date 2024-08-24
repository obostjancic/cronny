import logger from "./utils/logger.js";
import { cron } from "./cron.js";
import { executeRun } from "./run.js";
import { JobConfig, Runner } from "@cronny/types";
import { getSchedule } from "./db/schema.js";

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
    const strategyModule = await import(`./strategies/${config.strategy}.js`);

    if (strategyModule && strategyModule.run) {
      scheduleRun(config, strategyModule.run);
    }
  }
}
