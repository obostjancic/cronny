export type ArticleSummaryParams = {
  systemPrompt: string;
  model?: string;
  fallbackModel?: string;
  charOutputLength?: number;
};

export function buildArticleSummaryPrompt(
  systemPrompt: string,
  charOutputLength?: number,
): string {
  if (!charOutputLength) {
    return systemPrompt;
  }

  return `${systemPrompt}\n\nKeep the entire output at or below ${charOutputLength} characters.`;
}

export function parseArticleSummaryOutput(
  output: string,
  charOutputLength?: number,
): { title: string; text: string } {
  const purified = output.trim();

  if (!purified) {
    throw new Error("Empty model output");
  }

  if (charOutputLength && purified.length > charOutputLength) {
    throw new Error(`Model output exceeds ${charOutputLength} characters`);
  }

  const separator = purified.includes(";") ? ";" : ".";
  if (!purified.includes(separator)) {
    throw new Error("Model output is missing a separator");
  }

  const [title, ...text] = purified.split(separator);
  const sanitizedTitle = sanitizeTitle(title);
  const sanitizedText = sanitizeText(text.join(". "));

  if (!sanitizedTitle || !sanitizedText) {
    throw new Error("Model output is incomplete");
  }

  return { title: sanitizedTitle, text: sanitizedText };
}

function sanitizeText(text: string): string {
  return text
    .trim()
    .replaceAll("'. '", "")
    .replaceAll(" . ", "")
    .replaceAll("..", ".")
    .replaceAll("  ", " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function sanitizeTitle(title: string): string {
  return title
    .replaceAll("## ", "")
    .replaceAll("##", "")
    .replaceAll("*", "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .trim();
}
