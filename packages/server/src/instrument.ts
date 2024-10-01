import { getEnv, isProd } from "./utils/env.js";

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "DSN", // Replace with your DSN
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  enabled: isProd,
  environment: getEnv("NODE_ENV"),
});
