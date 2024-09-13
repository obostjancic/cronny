import { run } from "../../src/strategies/immoscout";
import * as immoscout from "../../src/strategies/immoscout";
import { describe, expect, it, vi } from "vitest";
import { rawResults, expectedResults } from "../fixtures/immoscout";

describe("Immoscout", () => {
  it("should return a list of properties", async () => {
    vi.spyOn(immoscout, "fetchImmoscoutSearch").mockResolvedValue(rawResults);

    const properties = await run({
      url: "https://www.immobilienscout24.at/portal/graphql?operationName=findPropertiesByParams&variables=%7B%22aspectRatio%22%3A1.77%2C%22params%22%3A%7B%22countryCode%22%3A%22AT%22%2C%22estateType%22%3A%22APARTMENT%22%2C%22from%22%3A%2215%22%2C%22size%22%3A%2210%22%2C%22transferType%22%3A%22RENT%22%2C%22useType%22%3A%22RESIDENTIAL%22%2C%22zipCode%22%3A%221200%22%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22sha256Hash%22%3A%221a73f5536e8aad220c24f1b4ce4f7654e3d7a1d932e85134f9efc1777f34f4ce%22%2C%22version%22%3A1%7D%7D",
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
        {
          prop: "coordinates",
          value: {
            points: [
              [48.245354254517025, 16.383104617032448],
              [48.243753797842075, 16.379242236436646],
              [48.239123623333185, 16.377010638759074],
              [48.23809463874962, 16.37486487176141],
              [48.23700846590269, 16.375379855840848],
              [48.232663543912786, 16.382503802273103],
              [48.22768929869673, 16.388683611226384],
              [48.21831124547864, 16.39057188678422],
              [48.206071446268226, 16.41323118627958],
              [48.21236329714503, 16.42413168447026],
            ],
          },
        },
      ],
    });

    expect(properties).toEqual(expectedResults);
  });
});
