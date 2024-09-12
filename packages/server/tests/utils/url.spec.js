import { describe, it, expect } from "vitest";
import { parseURLParams, replaceURLParams } from "../../src/utils/url";

describe("parseURLParams", () => {
  it("should return an empty object if there are no query parameters", () => {
    const url = "http://example.com";
    const result = parseURLParams(url);
    expect(result).toEqual({});
  });

  it("should parse single query parameter", () => {
    const url = "http://example.com?param1=value1";
    const result = parseURLParams(url);
    expect(result).toEqual({ param1: "value1" });
  });

  it("should parse multiple query parameters", () => {
    const url = "http://example.com?param1=value1&param2=value2";
    const result = parseURLParams(url);
    expect(result).toEqual({ param1: "value1", param2: "value2" });
  });

  it("should parse repeated query parameters into an array", () => {
    const url = "http://example.com?param1=value1&param1=value2";
    const result = parseURLParams(url);
    expect(result).toEqual({ param1: ["value1", "value2"] });
  });
});

describe("replaceURLParams", () => {
  it("should replace existing query parameters", () => {
    const url = "http://example.com?param1=value1";
    const params = { param1: "newValue" };
    const result = replaceURLParams(url, params);
    expect(result).toBe("http://example.com?param1=newValue");
  });

  it("should add new query parameters", () => {
    const url = "http://example.com";
    const params = { param1: "value1" };
    const result = replaceURLParams(url, params);
    expect(result).toBe("http://example.com?param1=value1");
  });

  it("should handle array query parameters", () => {
    const url = "http://example.com";
    const params = { param1: ["value1", "value2"] };
    const result = replaceURLParams(url, params);
    expect(result).toBe("http://example.com?param1=value1&param1=value2");
  });

  it("should merge existing and new query parameters", () => {
    const url = "http://example.com?param1=value1";
    const params = { param2: "value2" };
    const result = replaceURLParams(url, params);
    expect(result).toBe("http://example.com?param1=value1&param2=value2");
  });

  it("should replace and add multiple query parameters", () => {
    const url = "http://example.com?param1=value1&param2=value2";
    const params = { param1: "newValue1", param3: "value3" };
    const result = replaceURLParams(url, params);
    expect(result).toBe(
      "http://example.com?param1=newValue1&param2=value2&param3=value3"
    );
  });
});
