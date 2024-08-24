import { getLastRun, getPreviousRun } from "../db/schema.js";
import { NotificationConfig, Run, JSONObject } from "@cronny/types";

import { notifyLogFile } from "./log-file.js";
import logger from "../utils/logger.js";
import { sendWhatsappMessage } from "./whatsapp.js";
import { getEnv } from "../utils/env.js";

export async function notifyRun(run: Run): Promise<void> {
  if (run.status === "success" && run.config.notify?.onSuccess) {
    logger.debug(`Notifying on success for ${run.config.name}`);
    await notifySuccess(run);
  }

  if (run.status === "failure" && run.config.notify?.onFailure) {
    logger.debug(`Notifying on failure for ${run.config.name}`);
    await notifyFailure(run);
  }
}

async function notifySuccess(run: Run): Promise<void> {
  const { transport, params, onResultChangeOnly } =
    run.config.notify!.onSuccess!;

  if (onResultChangeOnly) {
    const prevRun = await getPreviousRun(run.config.jobId);

    const resultDiff = run.results?.filter(
      (result) =>
        !(prevRun?.results || []).some(
          (prevResult) => JSON.stringify(prevResult) === JSON.stringify(result)
        )
    );
    if (!resultDiff || resultDiff.length === 0) {
      logger.debug(`${run.config.name}: No new results found!`);
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

async function notifyFailure(run: Run): Promise<void> {
  const { transport, params } = run.config.notify!.onFailure!;

  const message = `${run.config.name} failed!`;

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

  return `${run.config.name}: ${resultsCount} results found! \n Check the results at ${getRunResultsUrl(run)}`;
}

function getRunResultsUrl(run: Run): string {
  return `${getEnv("BASE_URL")}/jobs/${run.jobId}/runs/${run.id}`;
}
