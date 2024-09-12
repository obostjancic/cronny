import { describe, it, expect } from "vitest";
import { matchDataFilter } from "../../src/utils/filter";

describe("matchDataFilter", () => {
  it("should return true when filter value is empty", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: "" };
    expect(matchDataFilter(result, filter)).toBe(true);
  });

  it("should return true when result matches filter value exactly", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: "John" };
    expect(matchDataFilter(result, filter)).toBe(true);
  });

  it("should return false when result does not match filter value", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: "Doe" };
    expect(matchDataFilter(result, filter)).toBe(false);
  });

  it("should return true when result matches filter value with wildcard at the start", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: "%hn" };
    expect(matchDataFilter(result, filter)).toBe(true);
  });

  it("should return true when result matches filter value with wildcard at the end", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: "Jo%" };
    expect(matchDataFilter(result, filter)).toBe(true);
  });

  it("should return true when result matches filter value with wildcards at both ends", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: "%oh%" };
    expect(matchDataFilter(result, filter)).toBe(true);
  });

  it("should return true when result matches one of the filter values in an array", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: ["Doe", "John"] };
    expect(matchDataFilter(result, filter)).toBe(true);
  });

  it("should return false when result does not match any of the filter values in an array", () => {
    const result = { name: "John" };
    const filter = { prop: "name", value: ["Doe", "Smith"] };
    expect(matchDataFilter(result, filter)).toBe(false);
  });
});
