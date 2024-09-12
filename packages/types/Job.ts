import type { JSONArray, JSONObject, JSONValue } from "./JSON.js";

export type UnsavedJob = {
  id?: number;
  strategy: string;
  name: string;
  enabled: boolean;
  cron: string;
  params: JSONObject | null;
  notify: Notify | null;
};

export type Notify = {
  onSuccess?: NotificationConfig;
  onFailure?: NotificationConfig;
};

export type Job = UnsavedJob & { id: number };

export type NotificationConfig = {
  transport: "file" | "email" | "slack" | "telegram" | "whatsapp" | "webhook";
  params: JSONObject;
  onResultChangeOnly?: boolean;
};

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

export type JobWithRuns = Job & { runs: Run[] };

export type Runner<Params = JSONObject, Result = JSONObject> = (
  params: Params | null
) => Promise<RunResult<Result> | null>;
