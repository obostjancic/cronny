import type {
  JSONObject,
  NotificationConfig,
  Notify,
  Run,
  RunResult,
} from "@cronny/types";

import { getEnv } from "../utils/env.js";
import logger from "../utils/logger.js";
import { notifyLogFile } from "./log-file.js";
import { sendWhatsappMessage } from "./whatsapp.js";
import { getPreviousRun } from "../db/run.js";
import { diff } from "../utils/diff.js";

export async function notifyRun(
  run: Run,
  jobName: string,
  notify: Notify
): Promise<void> {
  if (run.status === "success" && notify?.onSuccess) {
    logger.debug(`Notifying on success for ${run.id} of job ${jobName}`);
    await notifySuccess(run, jobName, notify.onSuccess!);
  }

  if (run.status === "failure" && notify?.onFailure) {
    logger.debug(`Notifying on failure for ${run.id} of job ${jobName}`);
    await notifyFailure(run, jobName, notify.onFailure!);
  }
}

async function notifySuccess(
  run: Run,
  jobName: string,
  config: NotificationConfig
): Promise<void> {
  const { transport, params, onResultChangeOnly } = config;

  if (onResultChangeOnly) {
    const prevRun = await getPreviousRun(run.jobId);

    const { added } = diff(prevRun?.data || [], run.data);

    if (added.length === 0) {
      logger.debug(`${jobName}: No new results found!`);
      return;
    }

    await notify({
      transport,
      params,
      message: constructMessage(run, jobName),
      results: { data: added },
    });
  } else {
    await notify({
      transport,
      params,
      message: constructMessage(run, jobName),
      results: { data: run.data },
    });
  }
}

async function notifyFailure(
  run: Run,
  jobName: string,
  config: NotificationConfig
): Promise<void> {
  const { transport, params } = config;

  const message = `Run ${run.id} of job ${jobName} failed!`;

  await notify({
    transport,
    params,
    message,
    results: {
      data: [],
    },
  });
}

async function notify({
  transport,
  params,
  results,
  message,
}: {
  transport: NotificationConfig["transport"];
  params: JSONObject;
  results: RunResult;
  message: string;
}): Promise<void> {
  logger.debug(`Notifying via ${transport}`, message);

  switch (transport) {
    case "file":
      notifyLogFile(params.path as string, results.data!);
      break;
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

function constructMessage(run: Run, jobName: string): string {
  const resultsCount = run.data?.length ?? 0;

  return `${jobName}: ${resultsCount} results found! \n Check the results at ${getRunResultsUrl(run)}`;
}

function getRunResultsUrl(run: Run): string {
  return `${getEnv("BASE_URL")}/jobs/${run.jobId}/runs/${run.id}`;
}
