import * as Sentry from "@sentry/node";
import { pino } from "pino";

export const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});

const errorFn = function (...args: any[]) {
  // @ts-expect-error idk
  logger.error(...args);
  if (!!args[0]) {
    Sentry.captureException(args[0]);
    return;
  }
};

export const createLogger = (name: string) => {
  const childLogger = logger.child({ name });
  childLogger.error = errorFn;

  return childLogger;
};

export default createLogger("");
