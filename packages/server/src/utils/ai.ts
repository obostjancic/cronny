import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { createLogger } from "./logger.js";

const logger = createLogger("ai");

const noReasoningSettings = {
  extraBody: { reasoning: { effort: "none" } },
};

export async function runPrompt(
  systemPrompt: string,
  prompt: string,
  model = "poolside/laguna-xs.2:free",
  fallbackModel?: string,
): Promise<string> {
  logger.info(`Running prompt ${prompt.slice(0, 25)}...`);

  try {
    const { text } = await generateText({
      model: openrouter(model, noReasoningSettings),
      prompt,
      system: systemPrompt,
    });

    return text ?? "";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isReasoningError = errorMessage.includes("reasoning");

    // Retry without reasoning settings if the model doesn't support them
    if (isReasoningError) {
      logger.warn(`Model ${model} doesn't support reasoning settings, retrying without`);
      const { text } = await generateText({
        model: openrouter(model),
        prompt,
        system: systemPrompt,
      });
      return text ?? "";
    }

    const fallback = fallbackModel ?? (model.includes(":free") ? model.replace(":free", "") : undefined);

    if (fallback) {
      logger.warn(
        `Model ${model} failed (${errorMessage}), retrying with fallback ${fallback}`,
      );

      const { text } = await generateText({
        model: openrouter(fallback, noReasoningSettings),
        prompt,
        system: systemPrompt,
      });

      return text ?? "";
    }

    throw error;
  }
}
