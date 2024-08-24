"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./utils/env");
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
Sentry.init({
    dsn: "https://ebbf41526041f9d3b5e27f5ece9ed5b4@o4505188109189120.ingest.us.sentry.io/4507669489713152",
    integrations: [nodeProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
    enabled: env_1.isProd,
    environment: (0, env_1.getEnv)("NODE_ENV"),
});
