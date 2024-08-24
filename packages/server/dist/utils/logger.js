import * as Sentry from "@sentry/node";
import { iso } from "./date.js";
const logger = {
    error: (message, ...optionalParams) => {
        console.error(iso(), message, ...optionalParams);
        Sentry.captureException(message, ...optionalParams);
    },
    log: (message, ...optionalParams) => {
        console.log(iso(), message, ...optionalParams);
    },
    debug: (message, ...optionalParams) => {
        console.debug(iso(), message, ...optionalParams);
    },
};
export default logger;
