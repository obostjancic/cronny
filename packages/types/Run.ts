import type { JSONObject } from "./JSON.js";

export type UnsavedRun = {
  id?: number;
  jobId: number;
  start: string;
  end: string | null;
  status: "running" | "success" | "failure";
};

export type Run = UnsavedRun & { id: number };

export type Runner<TParams = JSONObject, TResult = JSONObject> = (
  params: TParams | null
) => Promise<TResult[] | null>;
