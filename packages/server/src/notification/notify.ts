import type { Job, JSONObject, NotificationConfig, Run } from "@cronny/types";

import { getEnv } from "../utils/env.js";
import logger from "../utils/logger.js";
import { sendWhatsappMessage } from "./whatsapp.js";

export async function notifyRun(
  job: Job,
  run: Run,
  resultDiff: number
): Promise<void> {
  if (run.status === "success" && job.notify?.onSuccess) {
    logger.debug(`Notifying on success for ${run.id} of job ${job.name}`);
    await notifySuccess(job, run, resultDiff);
  }

  if (run.status === "failure" && job.notify?.onFailure) {
    logger.debug(`Notifying on failure for ${run.id} of job ${job.name}`);
    await notifyFailure(job, run);
  }
}

async function notifySuccess(
  job: Job,
  run: Run,
  resultDiff: number
): Promise<void> {
  const { transport, params, onResultChangeOnly } = job.notify!.onSuccess!;

  if (onResultChangeOnly) {
    if (resultDiff === 0) {
      logger.debug(`${job.name}: No new results found!`);
      return;
    }

    await notify({
      transport,
      params,
      message: constructMessage(job, run, resultDiff),
    });
  } else {
    await notify({
      transport,
      params,
      message: constructMessage(job, run, resultDiff),
    });
  }
}

async function notifyFailure(job: Job, run: Run): Promise<void> {
  const { transport, params } = job.notify!.onFailure!;

  const message = `Run ${run.id} of job ${job.name} failed!`;

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
      const phone = params.phone as string;
      sendWhatsappMessage(phone, message);
      break;
    case "webhook":
      // sendWebhook(params, message);
      break;
    default:
      logger.error(`Unsupported transport: ${transport}`);
  }
}

function constructMessage(job: Job, run: Run, resultDiff: number): string {
  return `${job.name}: ${resultDiff} results found! \n Check the results at ${getRunResultsUrl(run)}`;
}

function getRunResultsUrl(run: Run): string {
  return `${getEnv("BASE_URL")}/jobs/${run.jobId}/runs/${run.id}`;
}
