import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { createLogger } from "./logger.js";

const logger = createLogger("ai");

export async function runPrompt(
  systemPrompt: string,
  prompt: string,
  model = "google/gemma-3-27b-it:free",
): Promise<string> {
  logger.info(`Running prompt ${prompt.slice(0, 25)}...`);

  try {
    const { text } = await generateText({
      model: openrouter(model),
      prompt,
      system: systemPrompt,
    });

    return text ?? "";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (model.includes(":free")) {
      const paidModel = model.replace(":free", "");
      logger.warn(
        `Free model failed (${errorMessage}), retrying with paid model ${paidModel}`,
      );

      const { text } = await generateText({
        model: openrouter(paidModel),
        prompt,
        system: systemPrompt,
      });

      return text ?? "";
    }

    throw error;
  }
}
