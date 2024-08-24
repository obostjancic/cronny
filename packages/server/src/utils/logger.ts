import * as Sentry from "@sentry/node";
import { iso } from "./date.js";

const logger = {
  error: (message?: any, ...optionalParams: any[]) => {
    console.error(iso(), message, ...optionalParams);
    Sentry.captureException(message, ...optionalParams);
  },
  log: (message?: any, ...optionalParams: any[]) => {
    console.log(iso(), message, ...optionalParams);
  },
  debug: (message?: any, ...optionalParams: any[]) => {
    console.debug(iso(), message, ...optionalParams);
  },
};

export default logger;
