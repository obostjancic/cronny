import axios from "axios";
import logger from "../utils/logger.js";
import { getEnv, isProd } from "../utils/env.js";

const PRESUMED_WHATSAPP_MESSAGE_LENGTH = 738;

export async function sendWhatsappMessage(
  phone: string,
  message: string
): Promise<void> {
  const text = message.slice(0, PRESUMED_WHATSAPP_MESSAGE_LENGTH);

  const params = new URLSearchParams({
    phone,
    text,
    apikey: getEnv("WHATSAPP_API_KEY"),
  });

  if (!isProd && false) {
    logger.debug("Skipping sending message", params.toString());
    return;
  }

  try {
    await axios.get("https://api.callmebot.com/whatsapp.php", {
      params,
    });
  } catch (e) {
    logger.error("Error sending message", e);
  }
}
