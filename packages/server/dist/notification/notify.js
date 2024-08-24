"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyRun = notifyRun;
const schema_1 = require("../db/schema");
const log_file_1 = require("./log-file");
const logger_1 = __importDefault(require("../utils/logger"));
const whatsapp_1 = require("./whatsapp");
async function notifyRun(run) {
    if (run.status === "success" && run.config.notify?.onSuccess) {
        logger_1.default.debug(`Notifying on success for ${run.config.name}`);
        await notifySuccess(run);
    }
    if (run.status === "failure" && run.config.notify?.onFailure) {
        logger_1.default.debug(`Notifying on failure for ${run.config.name}`);
        await notifyFailure(run);
    }
}
async function notifySuccess(run) {
    const { transport, params, onResultChangeOnly } = run.config.notify.onSuccess;
    if (onResultChangeOnly) {
        const prevRun = await (0, schema_1.getPreviousRun)(run.config.jobId);
        const resultDiff = run.results?.filter((result) => !(prevRun?.results || []).some((prevResult) => JSON.stringify(prevResult) === JSON.stringify(result)));
        if (!resultDiff || resultDiff.length === 0) {
            logger_1.default.debug(`${run.config.name}: No new results found!`);
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
    logger_1.default.debug(`Notifying via ${transport}`, message);
    switch (transport) {
        case "file":
            (0, log_file_1.notifyLogFile)(params.path, results);
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
            (0, whatsapp_1.sendWhatsappMessage)(phone, message);
            break;
        case "webhook":
            // sendWebhook(params, message);
            break;
        default:
            logger_1.default.error(`Unsupported transport: ${transport}`);
    }
}
