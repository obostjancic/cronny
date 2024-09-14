import type { JSONObject } from "./JSON.ts";

export type ResultStatus = "active" | "expired" | "filtered" | "hidden";

export type UnsavedResult<T = JSONObject> = {
  jobId: number;
  runId: number;
  internalId: string;
  data: T;
  status: ResultStatus;
};

export type Result<T = JSONObject> = UnsavedResult<T> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};
