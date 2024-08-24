import { getEnv, isProd } from "./utils/env.js";

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://ebbf41526041f9d3b5e27f5ece9ed5b4@o4505188109189120.ingest.us.sentry.io/4507669489713152",
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  enabled: isProd,
  environment: getEnv("NODE_ENV"),
});
