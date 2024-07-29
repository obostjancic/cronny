import * as Sentry from "@sentry/node";
type JobConfigBase = {
  run: () => Promise<any[]>;
  id: string;
  name: string;
  disabled?: boolean;
  notify?: {
    channel: "whatsapp";
  };
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
  config: JobConfig;
  start: string;
  status: "running" | "success" | "failure";
  span: Sentry.Span;
  results?: T[];
  error?: Error;
};

export type Job = {
  id: string;
  name?: string;
  runs: FinishedRun[];
};

export type FinishedRun<T = any> = {
  id: string;
  start: string;
  end: string;
  status: "success" | "failure";
  params?: Record<string, unknown>;
  results?: T[];
};
