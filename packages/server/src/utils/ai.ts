import { getEnv } from "./env.js";

import { GoogleGenerativeAI, StartChatParams } from "@google/generative-ai";

const apiKey = getEnv("GEMINI_API_KEY");
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const DEFAULT_CONFIG = {
  temperature: 0,
  topP: 0.5,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function runPrompt(
  prompt: string,
  config: StartChatParams["generationConfig"] = DEFAULT_CONFIG
): Promise<string> {
  const chatSession = model.startChat({
    generationConfig: config,
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);

  return result.response.text();
}
