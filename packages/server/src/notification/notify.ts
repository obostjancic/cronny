import type { Job, JSONObject, NotificationConfig, Run } from "@cronny/types";

import { getEnv } from "../utils/env.js";
import { createLogger } from "../utils/logger.js";
import { sendWhatsappMessage } from "./whatsapp.js";

const logger = createLogger("notify");

export async function notifyRun(
  job: Job,
  run: Run,
  resultDiff: number
): Promise<void> {
  if (run.status === "success" && job.notify?.onSuccess) {
    logger.debug(`Notifying on success for run ${run.id} of job ${job.name}`);
    await notifySuccess(job, resultDiff);
  }

  if (run.status === "failure" && job.notify?.onFailure) {
    logger.debug(`Notifying on failure for run ${run.id} of job ${job.name}`);
    await notifyFailure(job);
  }
}

async function notifySuccess(job: Job, resultDiff: number): Promise<void> {
  const { transport, params, onResultChangeOnly } = job.notify!.onSuccess!;

  if (onResultChangeOnly) {
    if (resultDiff <= 0) {
      logger.debug(`${job.name}: No new results found!`);
      return;
    }

    await notify({
      transport,
      params,
      message: constructMessage(job, resultDiff),
    });
  } else {
    await notify({
      transport,
      params,
      message: constructMessage(job, resultDiff),
    });
  }
}

async function notifyFailure(job: Job): Promise<void> {
  const { transport, params } = job.notify!.onFailure!;

  const message = `Run for job ${job.name} failed!`;

  await notify({
    transport,
    params,
    message,
  });
}

async function notify({
  transport,
  params,
  message,
}: {
  transport: NotificationConfig["transport"];
  params: JSONObject;
  message: string;
}): Promise<void> {
  logger.debug(`Notifying via ${transport}`, message);

  switch (transport) {
    case "email":
      // sendEmail(params, message);
      break;
    case "slack":
      // sendSlack(params, message);
      break;
    case "telegram":
      // sendTelegram(params, message);
      break;
    case "whatsapp":
      sendWhatsappMessage(params.phone as string, message);
      break;
    case "webhook":
      // sendWebhook(params, message);
      break;
    default:
      logger.error(`Unsupported transport: ${transport}`);
  }
}

function constructMessage(job: Job, resultDiff: number): string {
  return `${job.name}: ${resultDiff} new results found! \n Check the results at ${getRunResultsUrl(job)}`;
}

function getRunResultsUrl(job: Job): string {
  return `${getEnv("BASE_URL")}/jobs/${job.id}`;
}
