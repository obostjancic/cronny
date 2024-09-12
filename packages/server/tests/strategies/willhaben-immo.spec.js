import { run } from "../../src/strategies/willhaben-immo";
import * as willhaben from "../../src/strategies/willhaben";
import { describe, expect, it, vi } from "vitest";
import { rawResults, expectedResults } from "../fixtures/willhaben-immo";

describe("Willhaben Immo", () => {
  it("should return a list of properties", async () => {
    vi.spyOn(willhaben, "run").mockResolvedValue({ data: rawResults });

    const properties = await run({
      url: "https://www.willhaben.at/iad/immobilien/mietwohnungen/mietwohnung-angebote?sfId=20ee62a7-8490-46d8-869d-de3fcf26bc5a&isNavigation=true&rows=90&areaId=117224&areaId=117242&page=1&PRICE_TO=1200&ESTATE_SIZE/LIVING_AREA_FROM=50",
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
          prop: "coords",
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
