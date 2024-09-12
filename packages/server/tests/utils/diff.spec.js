import { describe, it, expect } from "vitest";
import { diff } from "../../src/utils/diff";

describe("diff", () => {
  it("should return added and removed items correctly", () => {
    const a = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];
    const b = [
      { id: 2, name: "item2" },
      { id: 3, name: "item3" },
    ];

    const result = diff(a, b);

    expect(result.added).toEqual([{ id: 3, name: "item3" }]);
    expect(result.removed).toEqual([{ id: 1, name: "item1" }]);
  });

  it("should return empty arrays when there are no differences", () => {
    const a = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];
    const b = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];

    const result = diff(a, b);

    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it("should handle empty arrays", () => {
    const a = [];
    const b = [];

    const result = diff(a, b);

    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it("should handle when all items are added", () => {
    const a = [];
    const b = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];

    const result = diff(a, b);

    expect(result.added).toEqual(b);
    expect(result.removed).toEqual([]);
  });

  it("should handle when all items are removed", () => {
    const a = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];
    const b = [];

    const result = diff(a, b);

    expect(result.added).toEqual([]);
    expect(result.removed).toEqual(a);
  });
});
