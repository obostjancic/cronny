import type { JSONObject } from "./JSON.js";

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

export type UnsavedRun<T = JSONObject> = {
  id?: number;
  jobId: number;
  start: string;
  end: string | null;
  status: "running" | "success" | "failure";
  results: T[] | null;
};

export type Run = UnsavedRun & { id: number };

export type JobWithRuns = Job & { runs: Run[] };

export type Runner<T = any> = (
  params: JSONObject | null
) => Promise<T[] | null>;
