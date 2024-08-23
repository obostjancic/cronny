import { getLastRun } from "./db/schema";
import { Run, NotificationConfig } from "./types";
import logger from "./utils/logger";
import { sendWhatsappMessage } from "./utils/whatsapp";

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
    const lastRun = await getLastRun(run.config.jobId);

    const resultDiff = run.results?.filter(
      (result) =>
        !lastRun?.results?.some(
          (prevResult) => JSON.stringify(prevResult) === JSON.stringify(result)
        )
    );

    if (resultDiff && resultDiff.length > 0) {
      const message = `${run.config.name}: ${resultDiff.length} new results found!`;

      await notify(transport, params, message);
    }
  } else {
    const message = `${run.config.name}: ${
      run.results?.length ?? 0
    } results found!`;

    await notify(transport, params, message);
  }
}

async function notifyFailure(run: Run): Promise<void> {
  const { transport, params } = run.config.notify!.onFailure!;

  const message = `${run.config.name} failed!`;

  await notify(transport, params, message);
}

async function notify(
  transport: NotificationConfig["transport"],
  params: Record<string, unknown>,
  message: string
): Promise<void> {
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
