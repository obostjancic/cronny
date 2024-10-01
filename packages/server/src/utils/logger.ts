import { pino } from "pino";

export const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});

export const createLogger = (name: string) => {
  return logger.child({ name });
};

export default createLogger("");
