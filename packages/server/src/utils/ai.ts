import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { createLogger } from "./logger.js";
import { getEnv } from "./env.js";

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
  model = "google/gemini-2.0-flash-exp:free"
): Promise<string> {
  logger.info(`Running prompt ${prompt.slice(0, 25)}...`);

  const { text } = await generateText({
    model: openrouter(model, {
      apiKey: getEnv("OPENROUTER_API_KEY"),
    }),
    prompt,
    system: systemPrompt,
  });

  return text ?? "";
}
