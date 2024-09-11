import { JSONObject, NotificationConfig, Notify, Run } from "@cronny/types";

import { getEnv } from "../utils/env.js";
import logger from "../utils/logger.js";
import { notifyLogFile } from "./log-file.js";
import { sendWhatsappMessage } from "./whatsapp.js";
import { getPreviousRun } from "../db/run.js";

export async function notifyRun(run: Run, notify: Notify): Promise<void> {
  if (run.status === "success" && notify?.onSuccess) {
    logger.debug(`Notifying on success for ${run.jobId}`);
    await notifySuccess(run, notify.onSuccess!);
  }

  if (run.status === "failure" && notify?.onFailure) {
    logger.debug(`Notifying on failure for ${run.jobId}`);
    await notifyFailure(run, notify.onFailure!);
  }
}

async function notifySuccess(
  run: Run,
  config: NotificationConfig
): Promise<void> {
  const { transport, params, onResultChangeOnly } = config;

  if (onResultChangeOnly) {
    const prevRun = await getPreviousRun(run.jobId);

    const resultDiff = run.results?.filter(
      (result) =>
        !(prevRun?.results || []).some(
          (prevResult) => JSON.stringify(prevResult) === JSON.stringify(result)
        )
    );
    if (!resultDiff || resultDiff.length === 0) {
      logger.debug(`${run.jobId}: No new results found!`);
      return;
    }

    await notify({
      transport,
      params,
      message: constructMessage(run),
      results: resultDiff,
    });
  } else {
    await notify({
      transport,
      params,
      message: constructMessage(run),
      results: run.results,
    });
  }
}

async function notifyFailure(
  run: Run,
  config: NotificationConfig
): Promise<void> {
  const { transport, params } = config;

  const message = `${run.jobId} failed!`;

  await notify({ transport, params, message, results: null });
}

async function notify({
  transport,
  params,
  results,
  message,
}: {
  transport: NotificationConfig["transport"];
  params: JSONObject;
  results: unknown[] | null;
  message: string;
}): Promise<void> {
  logger.debug(`Notifying via ${transport}`, message);

  switch (transport) {
    case "file":
      notifyLogFile(params.path as string, results!);
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

function constructMessage(run: Run): string {
  const resultsCount = run.results?.length ?? 0;

  return `${run.jobId}: ${resultsCount} results found! \n Check the results at ${getRunResultsUrl(run)}`;
}

function getRunResultsUrl(run: Run): string {
  return `${getEnv("BASE_URL")}/jobs/${run.jobId}/runs/${run.id}`;
}
