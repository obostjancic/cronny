type JobConfigBase = {
  jobId: string;
  strategy: string;
  name: string;
  enabled?: boolean;
  params?: Record<string, unknown>;
  notify?: {
    onSuccess?: NotificationConfig & { onResultChangeOnly: boolean };
    onFailure?: NotificationConfig;
  };
};

export type NotificationConfig = {
  transport: "file" | "email" | "slack" | "telegram" | "whatsapp" | "webhook";
  params: Record<string, unknown>;
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

export type Run<T = any> = {
  id?: number;
  jobId: string;
  start: string;
  end: string | null;
  status: "running" | "success" | "failure";
  config: JobConfig;
  results: T[] | null;
};

export type Runner<T = any> = (
  params?: Record<string, unknown>
) => Promise<T[] | null>;
