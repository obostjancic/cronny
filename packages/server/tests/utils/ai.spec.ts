import { describe, expect, it } from "vitest";
import { normalizeModelName } from "../../src/utils/ai.js";

describe("normalizeModelName", () => {
  it("returns the default model for empty values", () => {
    expect(normalizeModelName()).toBe("poolside/laguna-xs.2:free");
    expect(normalizeModelName("   ")).toBe("poolside/laguna-xs.2:free");
  });

  it("maps poolside laguna aliases to the OpenRouter slug", () => {
    expect(normalizeModelName("poolside laguna")).toBe("poolside/laguna-xs.2:free");
    expect(normalizeModelName("Poolside Laguna XS.2")).toBe("poolside/laguna-xs.2:free");
    expect(normalizeModelName("poolside/laguna-xs.2")).toBe("poolside/laguna-xs.2:free");
  });

  it("leaves valid model slugs unchanged", () => {
    expect(normalizeModelName("google/gemma-3-27b-it")).toBe("google/gemma-3-27b-it");
  });
});
