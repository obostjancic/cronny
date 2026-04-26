import { run } from "../../src/strategies/appointments.ts";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockApiResponse } from "../fixtures/appointments.js";

global.fetch = vi.fn();

describe("Appointments Strategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  it("returns only finanzamt appointments when provider=finanzamt", async () => {
    const results = await run({ provider: "finanzamt" });

    expect(results).toHaveLength(1);
    expect(results[0].provider).toBe("finanzamt");
    expect(results[0].id).toBe("fin-1");
    expect(results[0].locationAddress).toBe(
      "Dr. Adolf-Schärf-Platz 2, 1220 Wien",
    );
    expect(results[0].forForeigners).toBe(true);
    expect(results[0].status).toBe("active");
    expect(results[0].title).toBe("2026-06-12 15:00 — Finanzamt Wien-Kagran");
  });

  it("returns all appointments when provider is omitted", async () => {
    const results = await run(null);

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.provider).sort()).toEqual([
      "finanzamt",
      "magistrate",
      "police",
    ]);
  });

  it("joins appointments with locations to set forForeigners and forCitizens", async () => {
    const results = await run({ provider: "all" });
    const byId = Object.fromEntries(results.map((r) => [r.id, r]));

    expect(byId["mag-1"].forCitizens).toBe(true);
    expect(byId["mag-1"].forForeigners).toBe(false);
    expect(byId["pol-1"].forForeigners).toBe(true);
    expect(byId["fin-1"].forForeigners).toBe(true);
    expect(byId["fin-1"].district).toBe("22");
  });

  it("marks rows that fail data filters as filtered", async () => {
    const results = await run({
      provider: "all",
      filters: [{ prop: "forForeigners", value: true }],
    });

    const byId = Object.fromEntries(results.map((r) => [r.id, r]));
    expect(byId["mag-1"].status).toBe("filtered");
    expect(byId["pol-1"].status).toBe("active");
    expect(byId["fin-1"].status).toBe("active");
  });

  it("supports negated filters", async () => {
    const results = await run({
      provider: "all",
      filters: [{ prop: "provider", value: "magistrate", negate: true }],
    });

    const byId = Object.fromEntries(results.map((r) => [r.id, r]));
    expect(byId["mag-1"].status).toBe("filtered");
    expect(byId["pol-1"].status).toBe("active");
    expect(byId["fin-1"].status).toBe("active");
  });

  it("throws when the API returns a non-ok response", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    });

    await expect(run({ provider: "finanzamt" })).rejects.toThrow(
      "appointments API request failed: 503 Service Unavailable",
    );
  });
});
