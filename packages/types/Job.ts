import type { JSONObject } from "./JSON.js";

type JobConfigBase = {
  jobId: string;
  strategy: string;
  name: string;
  enabled?: boolean;
  params?: JSONObject;
  notify?: {
    onSuccess?: NotificationConfig & { onResultChangeOnly: boolean };
    onFailure?: NotificationConfig;
  };
};

export type NotificationConfig = {
  transport: "file" | "email" | "slack" | "telegram" | "whatsapp" | "webhook";
  params: JSONObject;
};

export type JobConfig =
  | (JobConfigBase & {
      cron: string;
      interval?: never;
    })
  | (JobConfigBase & {
      interval: number;
      cron?: never;
    });

export type Run<T = JSONObject> = {
  id?: number;
  jobId: string;
  start: string;
  end: string | null;
  status: "running" | "success" | "failure";
  config: JobConfig;
  results: T[] | null;
};

export type Runner<T = any> = (params?: JSONObject) => Promise<T[] | null>;
