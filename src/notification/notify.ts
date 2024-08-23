import { getLastRun, getPreviousRun } from "../db/schema";
import { NotificationConfig, Run } from "../types";
import { notifyLogFile } from "./log-file";
import logger from "../utils/logger";
import { sendWhatsappMessage } from "./whatsapp";

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

    const message = `${run.config.name}: ${resultDiff.length} new results found!`;
    await notify({ transport, params, message, results: resultDiff });
  } else {
    const message = `${run.config.name}: ${
      run.results?.length ?? 0
    } results found!`;

    await notify({ transport, params, message, results: run.results });
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
  params: Record<string, unknown>;
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