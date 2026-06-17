# Bug Fix: Lint Script and TypeScript ESLint Failures

**Date:** 2026-06-17

## Symptom
`pnpm lint` failed because the root package had no lint script. Running the client lint directly failed on explicit `any` types and Fast Refresh warnings.

## Root Cause
The client job form used loose `any` types for strategy params, notifications, filters, and payloads. `App.tsx` exported a wrapped anonymous component, which triggered React Fast Refresh warnings. The server had no ESLint setup, so lint coverage stopped at the client.

## Fix
Added a root lint script that runs client and server lint. Removed client `any` types by adding typed job-form helpers and typed notification/strategy parameter values. Replaced the error-boundary HOC export with an `ErrorBoundary` component wrapper. Added server ESLint config and fixed the initial server lint issues without changing scraper behavior.

## Test
No regression test was added because this is lint/build tooling and static type cleanup, not a runtime bug. Verification is the lint, build, and existing test suite.

## Verification
- [x] Failing lint reproduced
- [x] Fix applied
- [x] `pnpm lint` passes
- [x] `pnpm build` passes
- [x] `pnpm --filter @cronny/server exec vitest run` passes

## Related
The client production build still warns about large chunks. That is unrelated to lint and should be handled separately with route/component code splitting if it becomes a real performance issue.
