import { getPreviousRun } from "../db/schema.js";
import { notifyLogFile } from "./log-file.js";
import logger from "../utils/logger.js";
import { sendWhatsappMessage } from "./whatsapp.js";
export async function notifyRun(run) {
    if (run.status === "success" && run.config.notify?.onSuccess) {
        logger.debug(`Notifying on success for ${run.config.name}`);
        await notifySuccess(run);
    }
    if (run.status === "failure" && run.config.notify?.onFailure) {
        logger.debug(`Notifying on failure for ${run.config.name}`);
        await notifyFailure(run);
    }
}
async function notifySuccess(run) {
    const { transport, params, onResultChangeOnly } = run.config.notify.onSuccess;
    if (onResultChangeOnly) {
        const prevRun = await getPreviousRun(run.config.jobId);
        const resultDiff = run.results?.filter((result) => !(prevRun?.results || []).some((prevResult) => JSON.stringify(prevResult) === JSON.stringify(result)));
        if (!resultDiff || resultDiff.length === 0) {
            logger.debug(`${run.config.name}: No new results found!`);
            return;
        }
        const message = `${run.config.name}: ${resultDiff.length} new results found!`;
        await notify({ transport, params, message, results: resultDiff });
    }
    else {
        const message = `${run.config.name}: ${run.results?.length ?? 0} results found!`;
        await notify({ transport, params, message, results: run.results });
    }
}
async function notifyFailure(run) {
    const { transport, params } = run.config.notify.onFailure;
    const message = `${run.config.name} failed!`;
    await notify({ transport, params, message, results: null });
}
async function notify({ transport, params, results, message, }) {
    logger.debug(`Notifying via ${transport}`, message);
    switch (transport) {
        case "file":
            notifyLogFile(params.path, results);
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
            const phone = params.phone;
            sendWhatsappMessage(phone, message);
            break;
        case "webhook":
            // sendWebhook(params, message);
            break;
        default:
            logger.error(`Unsupported transport: ${transport}`);
    }
}
