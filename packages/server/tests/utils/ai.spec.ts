import { describe, expect, it } from "vitest";
import { normalizeModelName } from "../../src/utils/ai.js";
import { normalizeJobParams } from "../../src/utils/model.js";

describe("normalizeModelName", () => {
  it("returns the default model for empty values", () => {
    expect(normalizeModelName()).toBe("poolside/laguna-xs.2:free");
    expect(normalizeModelName("   ")).toBe("poolside/laguna-xs.2:free");
  });

  it("leaves valid model slugs unchanged", () => {
    expect(normalizeModelName("poolside/laguna-xs.2:free")).toBe("poolside/laguna-xs.2:free");
    expect(normalizeModelName("google/gemma-3-27b-it")).toBe("google/gemma-3-27b-it");
  });

  it("extracts slugs from legacy label strings", () => {
    expect(normalizeModelName("Gemma 3 27B (Free) (google/gemma-3-27b-it:free)")).toBe(
      "google/gemma-3-27b-it:free"
    );
    expect(normalizeModelName("Gemma 3 27B (Free) (google/gemma-3-27b-it)")).toBe(
      "google/gemma-3-27b-it"
    );
  });
});

describe("normalizeJobParams", () => {
  it("rewrites model fields to plain slugs", () => {
    expect(
      normalizeJobParams({
        model: "Gemma 3 27B (Free) (google/gemma-3-27b-it:free)",
        fallbackModel: "Claude 3.5 Sonnet (anthropic/claude-3.5-sonnet)",
        nested: {
          model: "openai/gpt-4o-mini",
        },
      })
    ).toEqual({
      model: "google/gemma-3-27b-it:free",
      fallbackModel: "anthropic/claude-3.5-sonnet",
      nested: {
        model: "openai/gpt-4o-mini",
      },
    });
  });
});
