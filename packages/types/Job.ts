import type { JSONObject } from "./JSON.js";
import type { Result } from "./Result.js";
import { Run } from "./Run.js";

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

export type JobDetails = Job & { results: Result[]; runs: Run[] };
