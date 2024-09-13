import { describe, it, expect } from "vitest";
import { arrayDiff, objectDiff } from "../../src/utils/diff";

describe("arrayDiff", () => {
  it("should return added and removed items correctly", () => {
    const a = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];
    const b = [
      { id: 2, name: "item2" },
      { id: 3, name: "item3" },
    ];

    const result = arrayDiff(a, b);

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

    const result = arrayDiff(a, b);

    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it("should handle empty arrays", () => {
    const a = [];
    const b = [];

    const result = arrayDiff(a, b);

    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it("should handle when all items are added", () => {
    const a = [];
    const b = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];

    const result = arrayDiff(a, b);

    expect(result.added).toEqual(b);
    expect(result.removed).toEqual([]);
  });

  it("should handle when all items are removed", () => {
    const a = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
    ];
    const b = [];

    const result = arrayDiff(a, b);

    expect(result.added).toEqual([]);
    expect(result.removed).toEqual(a);
  });
});

describe("objectDiff", () => {
  it("should return added, removed, and changed keys", () => {
    const a = { id: 1, name: "a" };
    const b = { id: 1, name: "b", age: 30 };

    const result = objectDiff(a, b);

    expect(result).toEqual({
      added: ["age"],
      removed: [],
      changed: ["name"],
    });
  });

  it("should return empty arrays when no keys are added, removed, or changed", () => {
    const a = { id: 1, name: "a" };
    const b = { id: 1, name: "a" };

    const result = objectDiff(a, b);

    expect(result).toEqual({
      added: [],
      removed: [],
      changed: [],
    });
  });

  it("should return removed keys when keys are missing in the second object", () => {
    const a = { id: 1, name: "a", age: 30 };
    const b = { id: 1, name: "a" };

    const result = objectDiff(a, b);

    expect(result).toEqual({
      added: [],
      removed: ["age"],
      changed: [],
    });
  });
});
