import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { createLogger } from "./logger.js";
import { normalizeModelSlug } from "./model.js";

const logger = createLogger("ai");

const noReasoningSettings = {
  extraBody: { reasoning: { effort: "none" } },
};

export function normalizeModelName(model?: string): string {
  return normalizeModelSlug(model);
}

export async function runPrompt(
  systemPrompt: string,
  prompt: string,
  model = "poolside/laguna-xs.2:free",
  fallbackModel?: string,
  maxOutputLength?: number,
): Promise<string> {
  logger.info(`Running prompt ${prompt.slice(0, 25)}...`);

  const normalizedModel = normalizeModelName(model);
  const normalizedFallbackModel = fallbackModel ? normalizeModelName(fallbackModel) : undefined;
  const promptWithConstraints = appendOutputLengthConstraint(systemPrompt, maxOutputLength);

  try {
    return generatePromptText(
      normalizedModel,
      promptWithConstraints,
      prompt,
      true,
      maxOutputLength,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isReasoningError = errorMessage.includes("reasoning");

    // Retry without reasoning settings if the model doesn't support them
    if (isReasoningError) {
      logger.warn(`Model ${normalizedModel} doesn't support reasoning settings, retrying without`);
      return generatePromptText(
        normalizedModel,
        promptWithConstraints,
        prompt,
        false,
        maxOutputLength,
      );
    }

    const fallback = normalizedFallbackModel
      ?? (normalizedModel.includes(":free") ? normalizedModel.replace(":free", "") : undefined);

    if (fallback) {
      logger.warn(
        `Model ${normalizedModel} failed (${errorMessage}), retrying with fallback ${fallback}`,
      );

      return generatePromptText(
        fallback,
        promptWithConstraints,
        prompt,
        true,
        maxOutputLength,
      );
    }

    throw error;
  }
}

export function ensureOutputLength(text: string, maxOutputLength?: number): string {
  const normalizedText = text.trim();

  if (maxOutputLength == null) {
    return normalizedText;
  }

  if (!Number.isInteger(maxOutputLength) || maxOutputLength < 1) {
    throw new Error("maxOutputLength must be a positive integer");
  }

  if (normalizedText.length > maxOutputLength) {
    throw new Error(
      `Generated output exceeded maxOutputLength (${normalizedText.length}/${maxOutputLength})`
    );
  }

  return normalizedText;
}

async function generatePromptText(
  model: string,
  systemPrompt: string,
  prompt: string,
  disableReasoning: boolean,
  maxOutputLength?: number,
): Promise<string> {
  const { text } = await generateText({
    model: disableReasoning ? openrouter(model, noReasoningSettings) : openrouter(model),
    prompt,
    system: systemPrompt,
  });

  return ensureOutputLength(text ?? "", maxOutputLength);
}

function appendOutputLengthConstraint(
  systemPrompt: string,
  maxOutputLength?: number,
): string {
  if (maxOutputLength == null) {
    return systemPrompt;
  }

  return `${systemPrompt.trim()}\n\nHard limit: return no more than ${maxOutputLength} characters total.`;
}
