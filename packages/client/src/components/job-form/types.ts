import type { JSONValue, NotificationConfig } from "@cronny/types";

export type NotifyTransport = NotificationConfig["transport"];
export type NotifyTrigger = "onSuccess" | "onFailure";
export type NotifyConfigValue = JSONValue | undefined;

export interface NotifyConfig {
  type: NotifyTransport;
  trigger?: NotifyTrigger;
  onResultChangeOnly?: boolean;
  [key: string]: NotifyConfigValue;
}

export type StrategyParamValue = string | number | boolean | string[] | null | undefined;
export type StrategyParamValues = Record<string, StrategyParamValue>;
