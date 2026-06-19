import { describe, expect, it } from "vitest";
import {
  buildArticleSummaryPrompt,
  parseArticleSummaryOutput,
} from "../../src/strategies/article-summary.js";

describe("article summary helpers", () => {
  it("adds a character length hint to the system prompt", () => {
    expect(buildArticleSummaryPrompt("Summarize the article", 280)).toContain("280 characters");
    expect(buildArticleSummaryPrompt("Summarize the article")).toBe("Summarize the article");
  });

  it("parses valid model output", () => {
    expect(parseArticleSummaryOutput("Breaking news. Short summary text.")).toEqual({
      title: "Breaking news",
      text: "Short summary text.",
    });
  });

  it("rejects model output that exceeds the configured length", () => {
    expect(() => parseArticleSummaryOutput("Breaking news. Short summary text.", 10)).toThrow(
      "Model output exceeds 10 characters",
    );
  });

  it("rejects model output without a separator", () => {
    expect(() => parseArticleSummaryOutput("Breaking news without separator")).toThrow(
      "Model output is missing a separator",
    );
  });
});
