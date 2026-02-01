import * as Sentry from "@sentry/node";
import { pino } from "pino";

export const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});

export interface AppLogger {
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  debug: (msg: string, ...args: unknown[]) => void;
  error: (msgOrError: string | Error | unknown, ...args: unknown[]) => void;
}

export const createLogger = (name: string): AppLogger => {
  const childLogger = logger.child({ name });

  return {
    info: (msg: string, ...args: unknown[]) => {
      if (args.length > 0 && typeof args[0] === "object") {
        childLogger.info(args[0] as object, msg);
      } else {
        childLogger.info(msg);
      }
    },
    warn: (msg: string, ...args: unknown[]) => {
      if (args.length > 0 && typeof args[0] === "object") {
        childLogger.warn(args[0] as object, msg);
      } else {
        childLogger.warn(msg);
      }
    },
    debug: (msg: string, ...args: unknown[]) => {
      if (args.length > 0 && typeof args[0] === "object") {
        childLogger.debug(args[0] as object, msg);
      } else {
        childLogger.debug(msg);
      }
    },
    error: (msgOrError: string | Error | unknown, ...args: unknown[]) => {
      if (msgOrError instanceof Error) {
        childLogger.error({ err: msgOrError }, msgOrError.message);
        Sentry.captureException(msgOrError);
      } else if (typeof msgOrError === "string") {
        if (args.length > 0) {
          const err = args[0];
          if (err instanceof Error) {
            childLogger.error({ err }, msgOrError);
            Sentry.captureException(err);
          } else if (typeof err === "object") {
            childLogger.error(err as object, msgOrError);
          } else {
            childLogger.error(msgOrError);
          }
        } else {
          childLogger.error(msgOrError);
        }
      } else {
        // Unknown error type
        childLogger.error({ err: msgOrError }, "Unknown error");
        if (msgOrError && typeof msgOrError === "object") {
          Sentry.captureException(msgOrError);
        }
      }
    },
  };
};

export default createLogger("");
