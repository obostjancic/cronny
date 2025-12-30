import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { createLogger } from "./logger.js";

const logger = createLogger("ai");

const DEFAULT_CONFIG = {
  temperature: 0,
  topP: 0.5,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

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

    if (
      model.includes("free") &&
      errorMessage.includes("free-models-per-day-high-balance")
    ) {
      logger.warn(`Free model rate limit hit, retrying with paid model`);

      const { text } = await generateText({
        model: openrouter("google/gemma-3-27b-it"),
        prompt,
        system: systemPrompt,
      });

      return text ?? "";
    }

    throw error;
  }
}
