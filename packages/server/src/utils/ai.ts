import { create } from "flat-cache";
import { getEnv } from "./env.js";

import { GenerateContentParameters, GoogleGenAI } from "@google/genai";
import { createLogger } from "./logger.js";

const logger = createLogger("ai");

const apiKey = getEnv("GEMINI_API_KEY");
const genAI = new GoogleGenAI({
  apiKey,
});

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
  config?: GenerateContentParameters,
): Promise<string> {
  logger.info(`Running prompt ${prompt.slice(0, 25)}...`);
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      ...DEFAULT_CONFIG,
      ...(config || {}),
      systemInstruction: systemPrompt,
    },
  });

  return result.text ?? "";
}
