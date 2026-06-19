# Bug Fix: OpenRouter model fields use slugs only

**Date:** 2026-06-19

## Symptom
AI jobs failed with OpenRouter errors like `Gemma 3 27B (Free) (google/gemma-3-27b-it) is not a valid model ID` even though the underlying model existed.

## Root Cause
The job form wrote label-style model values instead of plain OpenRouter slugs. The backend then passed those label strings through to OpenRouter. Existing saved jobs could also keep those bad values in `params.model` and `params.fallbackModel`.

## Fix
Changed the model UI to show and submit slugs only. Updated model option labels, field copy, and combobox data to use plain slugs. Added backend normalization for `model` and `fallbackModel` params so saved jobs are returned and persisted as slugs.

## Test
Added regression tests for legacy label-string cleanup and nested job param normalization.

## Verification
- [x] Failing test written and confirmed failing
- [x] Fix applied
- [x] Test passes
- [x] Full test suite passes
- [x] Linter/type checks pass
- [x] No related occurrences found

## Related
None.
