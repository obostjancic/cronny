import { describe, expect, it, beforeAll } from "vitest";
import fs from "fs";
import path from "path";

// Ensure the .data directory exists before importing modules that use the database
beforeAll(() => {
  const dataDirPath = "./.data";
  if (!fs.existsSync(dataDirPath)) {
    fs.mkdirSync(dataDirPath, { recursive: true });
  }
});

import { equalResults } from "../src/run";

const a = {
  id: 3183,
  title: "Smart",
  price: 1026.3,
  address: "foo bar 100",
  rooms: 3,
  coordinates: [49.2382369, 16.386663],
  size: 49,
  url: "https://www.willhaben.at/iad/object?adId=19945605",
  status: "active",
  createdAt: "2024-10-22T18:24:01.387Z",
  updatedAt: "2024-10-22T18:24:01.387Z",
  internalId: "19945605",
  runId: 12939,
  jobId: 1,
  data: {
    id: "19945605",
    title: "Smart",
    price: 1026.3,
    address: "foo bar 100",
    rooms: 3,
    coordinates: [49.2382369, 16.386663],
    size: 49,
    url: "https://www.willhaben.at/iad/object?adId=19945605",
    status: "active",
  },
  isHidden: false,
};

const b = {
  id: 3180,
  title: "Smart",
  price: 1026.3,
  address: "foo bar 100",
  rooms: 3,
  coordinates: [49.2382369, 16.386663],
  size: 49,
  url: "https://www.willhaben.at/iad/object?adId=19945605",
  status: "expired",
  createdAt: "2024-10-22T18:12:01.224Z",
  updatedAt: "2024-10-22T18:18:01.593Z",
  internalId: "19945605",
  runId: 12931,
  jobId: 1,
  data: {
    id: "19945605",
    title: "Smart",
    price: 1026.3,
    address: "foo bar 100",
    rooms: 3,
    coordinates: [49.2382369, 16.386663],
    size: 49,
    url: "https://www.willhaben.at/iad/object?adId=19945605",
    status: "active",
  },
  isHidden: false,
};

describe("equalResults", () => {
  it("should return true when the reuslts are equal", () => {
    const result = equalResults(a, b);
    expect(result).toBe(true);
  });

  it("should return true if the internalIds change but data stays the same", () => {
    const aCopy = { ...a };
    aCopy.internalId = "foo";
    const result = equalResults(aCopy, b);
    expect(result).toBe(true);
  });

  it("should return true if internalId stays the same but data changes", () => {
    const aCopy = { ...a };
    aCopy.data.price = -1;
    const result = equalResults(aCopy, b);
    expect(result).toBe(true);
  });

  it("should return false if both internalId and data change", () => {
    const aCopy = { ...a };
    aCopy.internalId = "foo";
    aCopy.price = -1;
    const result = equalResults(aCopy, b);
    expect(result).toBe(false);
  });
});
