"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsappMessage = sendWhatsappMessage;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = require("../utils/env");
const PRESUMED_WHATSAPP_MESSAGE_LENGTH = 738;
async function sendWhatsappMessage(phone, message) {
    const text = message.slice(0, PRESUMED_WHATSAPP_MESSAGE_LENGTH);
    const params = new URLSearchParams({
        phone,
        text,
        apikey: (0, env_1.getEnv)("WHATSAPP_API_KEY"),
    });
    if (!env_1.isProd) {
        logger_1.default.debug("Skipping sending message", params.toString());
        return;
    }
    try {
        await axios_1.default.get("https://api.callmebot.com/whatsapp.php", {
            params,
        });
    }
    catch (e) {
        logger_1.default.error("Error sending message", e);
    }
}
