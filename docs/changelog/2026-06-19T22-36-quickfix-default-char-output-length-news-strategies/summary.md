# Summary: add optional output length limits to news AI strategies

**Date:** 2026-06-19

## What Changed
- Added an optional `charOutputLength` strategy param to `klix-rss` and `standard-rss`.
- Enforced the limit in `packages/server/src/utils/ai.ts` by validating generated output length after each model response.
- Kept the default as no limit by leaving the param unset unless the user enters a value.
- Preserved per-item failure behavior: if one generated output exceeds the limit, that article is skipped and the rest continue.
- Updated the job form schema and number input handling so the new field is an integer-only input in the UI.
- Added tests for the output-length validation helper.
- Installed workspace packages to sync dependencies before the final build.

## Why
We needed a simple way to cap AI-generated output for the click sources and standard sources news strategies without introducing a global default. Invalid outputs should fail only that item, not the whole run.

## Key Decisions
- Enforce the limit in the shared AI utility instead of duplicating checks in each strategy.
- Treat an empty UI value as no limit rather than inventing a default.
- Fail fast on overlong generated output and let the existing per-item strategy error handling skip that item.

## Files Changed
- `packages/types/StrategySchema.ts`
- `packages/client/src/components/job-form/StrategyParamsForm.tsx`
- `packages/server/src/utils/ai.ts`
- `packages/server/src/strategies/klix-rss.ts`
- `packages/server/src/strategies/standard-rss.ts`
- `packages/server/tests/utils/ai.spec.ts`
