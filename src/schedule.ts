import logger from "./utils/logger";
import { cron } from "./cron";
import * as db from "./db";
import * as grillzone from "./jobs/grillzone";
import * as stub from "./jobs/stub";
import * as willhaben from "./jobs/willhaben";
import * as willhabenImmo from "./jobs/willhaben-immo";
import { executeRun } from "./run";
import { JobConfig } from "./types";

const SCHEDULE: JobConfig[] = [
  {
    id: "stub",
    name: "Stub job",
    interval: 5000,
    disabled: true,
    run: () => {
      return stub.run();
    },
  },
  {
    id: "willhaben",
    name: "Willhaben search",
    cron: "5 */1 * * * *",
    disabled: true,
    run: () => {
      return willhaben.run({
        url: "https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz/pkw-ersatzteile-zubehoer/reifen-felgen-6272?keyword=radkappen+16+hyundai&sfId=bd3346c3-10a4-4b07-b142-026a76dd239b&rows=30&isNavigation=true",
      });
    },
  },
  {
    id: "willhaben-immo",
    name: "Willhaben immo search",
    cron: "10 */1 * * * *",
    disabled: true,
    run: () => {
      return willhabenImmo.run({
        url: "https://www.willhaben.at/iad/immobilien/mietwohnungen/mietwohnung-angebote?sfId=20ee62a7-8490-46d8-869d-de3fcf26bc5a&isNavigation=true&areaId=117242&NO_OF_ROOMS_BUCKET=2X2",
        center: [48.235731014317956, 16.388054168902784],
        radius: 0.5, // km
      });
    },
  },
  {
    id: "grillzone",
    name: "Grillzone area search",
    cron: "0 */1 * * * *",
    disabled: true,
    run: () => {
      return grillzone.run({
        from: new Date("01-01-2024"),
        to: new Date("12-31-2024"),
        areas: [0, 1, 2, 3, 4],
      });
    },
  },
];

function scheduleRun(config: JobConfig): void {
  if (config.disabled) {
    logger.debug(`Skipping ${config.name} - disabled`);
    return;
  }

  logger.debug(`Scheduling ${config.name}`);

  if (config.cron) {
    cron(config);
  } else {
    setInterval(() => executeRun(config), config.interval);
  }
}

export async function scheduleRuns(): Promise<void> {
  const jobs = await db.getJobs();

  for (const config of SCHEDULE) {
    if (!jobs.some((job) => job.id === config.id)) {
      await db.saveJob(config.id);
    }
  }

  SCHEDULE.forEach((config) => scheduleRun(config));
}

export function getSchedule(): JobConfig[] {
  return SCHEDULE;
}
