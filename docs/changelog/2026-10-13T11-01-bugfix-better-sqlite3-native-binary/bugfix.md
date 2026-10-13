# Bug Fix: Restore the compatible better-sqlite3 binary

**Date:** 2026-10-13

## Symptom

The test gate could not load `better-sqlite3` while importing the database schema. The native module requested `libc.musl-x86_64.so.1`, which is unavailable in the glibc-based sandbox.

## Root Cause

The worktree's ignored `node_modules` directory contained the musl build of `better-sqlite3`. The current sandbox uses glibc, so Node could not load that binary. The database schema and tests were not at fault.

## Fix

Reinstalled the platform-appropriate `better-sqlite3` prebuilt binary using its bundled `prebuild-install` command. This restores the glibc-compatible binary used by the existing dependency version.

## Test

No new regression test was added. The failure occurs before test collection in a third-party native dependency and is already reproduced by the existing `tests/run.spec.js` import path.

## Verification

- [x] Existing failing test suite reproduced the native-library error
- [x] Compatible native binary installed
- [x] Focused `tests/run.spec.js` passes
- [x] Server test suite passes
- [x] Linter and build checks pass
- [x] No related source-code occurrences found

## Assumptions

The gate uses this repaired worktree dependency installation. Fresh pnpm installs select the platform-appropriate prebuilt binary automatically.

## Related

None.
