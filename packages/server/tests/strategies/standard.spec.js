import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "../../src/strategies/standard";
import { expectedResults, rawResults } from "../fixtures/standard";

describe("Standard", () => {
  beforeEach(() => {
    vi.spyOn(axios, "get").mockResolvedValue({
      data: rawResults,
    });
  });

  it("should return a list of properties", async () => {
    const properties = await run({
      url: "https://immobilien.derstandard.at/suche/multi-1990594-1991433/mieten-wohnung?areaFrom=50&priceTo=1400",
      filters: [
        {
          prop: "title",
          value: [
            "%| ERSTBEZUG |%",
            "%KAY%",
            "%gemeinde%",
            "%Anbindung in Wien Brigittenau",
          ],
          negate: true,
        },
      ],
    });
    expect(properties).toEqual(expectedResults);
  });
});
