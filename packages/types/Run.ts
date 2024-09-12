import { JSONObject } from "./JSON.js";

export type UnsavedRun<TResult = JSONObject> = {
  id?: number;
  jobId: number;
  start: string;
  end: string | null;
  status: "running" | "success" | "failure";
} & RunResult<TResult>;

export type RunResult<TResult = JSONObject> = {
  data: TResult[];
  meta?: JSONObject;
};

export type Run = UnsavedRun & { id: number };

export type Runner<Params = JSONObject, Result = JSONObject> = (
  params: Params | null
) => Promise<RunResult<Result> | null>;
