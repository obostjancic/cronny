import { run } from "../../src/strategies/olx.js";
import { describe, expect, it, vi } from "vitest";
import { mockOlxApiResponse, expectedOlxResults } from "../fixtures/olx.js";

// Mock the fetch function
global.fetch = vi.fn();

describe("OLX Strategy", () => {
  it("should return a list of properties from OLX URL", async () => {
    // Mock the fetch response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockOlxApiResponse,
    });

    const properties = await run({
      url: "https://www.olx.ba/pretraga?q=stan&city_id=1&price_max=1000",
      filters: [
        {
          prop: "price",
          value: 900,
          operator: "lt",
        },
        {
          prop: "rooms",
          value: 1,
          operator: "gt",
        },
      ],
    });

    expect(properties).toEqual(expectedOlxResults);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.olx.ba/search"),
      expect.objectContaining({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should handle empty API response", async () => {
    // Mock empty response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { total: 0 } }),
    });

    const properties = await run({
      url: "https://www.olx.ba/pretraga?q=nonexistent",
    });

    expect(properties).toEqual([]);
  });

  it("should handle API errors", async () => {
    // Mock API error
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(
      run({
        url: "https://www.olx.ba/pretraga?q=test",
      })
    ).rejects.toThrow("OLX API request failed: 500 Internal Server Error");
  });

  it("should convert OLX website URL to API URL correctly", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await run({
      url: "https://www.olx.ba/pretraga?q=dvosoban+stan&city_id=1&price_max=800&area_min=50",
    });

    const calledUrl = fetch.mock.calls[0][0];
    const url = new URL(calledUrl);

    expect(url.searchParams.get("category_id")).toBe("2");
    expect(url.searchParams.get("q")).toBe("dvosoban+stan");
    expect(url.searchParams.get("city_id")).toBe("1");
    expect(url.searchParams.get("price_max")).toBe("800");
    expect(url.searchParams.get("area_min")).toBe("50");
  });

  it("should extract search terms from URL path when no query parameter exists", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await run({
      url: "https://www.olx.ba/oglasi/nekretnine/stanovi/sarajevo",
    });

    const calledUrl = fetch.mock.calls[0][0];
    const url = new URL(calledUrl);

    expect(url.searchParams.get("category_id")).toBe("2");
    expect(url.searchParams.get("q")).toBe("stanovi sarajevo");
  });

  it("should handle malformed URLs gracefully", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await run({
      url: "invalid-url",
    });

    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toBe("https://api.olx.ba/search?category_id=2");
  });
});