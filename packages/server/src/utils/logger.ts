import * as Sentry from "@sentry/node";
import { iso } from "./date.js";

import { pino } from "pino";

export const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});
// export const createLogger = (name: string) => {
//   name = name ? `[${name}]` : name;
//   return {
//     error: (message?: any, ...optionalParams: any[]) => {
//       console.error(iso(), name, message, ...optionalParams);
//       Sentry.captureException(message, ...optionalParams);
//     },
//     log: (message?: any, ...optionalParams: any[]) => {
//       console.log(iso(), name, message, ...optionalParams);
//     },
//     debug: (message?: any, ...optionalParams: any[]) => {
//       console.debug(iso(), name, message, ...optionalParams);
//     },
//   };
// };

export const createLogger = (name: string) => {
  return logger.child({ name });
};

export default createLogger("");
