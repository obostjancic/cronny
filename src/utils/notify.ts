import axios from "axios";
import logger from "./logger";
import { isProd } from "./env";

const PRESUMED_WHATSAPP_MESSAGE_LENGTH = 738;

export async function notify(title: string, body: string): Promise<void> {
  const bodyLength = PRESUMED_WHATSAPP_MESSAGE_LENGTH - title.length;
  const truncatedBody =
    body.length > bodyLength ? `${body.slice(0, bodyLength - 3)}...` : body;

  const params = new URLSearchParams({
    phone: process.env.WHATSAPP_PHONE || "",
    text: `${title}\n${truncatedBody}`,
    apikey: process.env.WHATSAPP_API_KEY || "",
  });

  if (!isProd) {
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
