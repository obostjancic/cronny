import axios from "axios";
import { isProd } from "../utils/env.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("slack");

export async function sendSlack(
  webhookUrl: string,
  message: string
): Promise<void> {
  if (!isProd) {
    logger.debug("Skipping sending message");
    return;
  }

  try {
    await axios.post(webhookUrl, { text: message });
  } catch (e) {
    logger.error("Error sending message", e);
  }
}
