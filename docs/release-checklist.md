# Release Checklist

## Pre-Release Gates (P0)

- [ ] `npm run ci` passes locally.
- [ ] GitHub Actions CI is green on `main`.
- [ ] Supabase env is configured:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] Optional monitoring configured:
  - [ ] `VITE_SENTRY_DSN` (production)

## Security and Data Integrity

- [ ] RLS policies exist and guard `user_id` tables.
- [ ] Offline sync queue has no unbounded growth (`MAX_QUEUE_ITEMS` enforced).
- [ ] Queue retry behavior validated (offline -> online replay).
- [ ] Sync status indicator visible in app for pending/failed/offline cases.

## Critical Smoke Tests

- [ ] Sign in and onboarding flow works end-to-end.
- [ ] Daily status save works online and offline.
- [ ] Tracker updates (fasting/tarawih/sedekah) survive temporary network failure.
- [ ] Reflection autosave and completion work after reconnect.
- [ ] Weekly share summary still generates with cached data when API fails.

## Monitoring and Operations

- [ ] Sentry receives test event in production.
- [ ] Browser console has no uncaught runtime error on first load.
- [ ] Error rate alerting threshold is set.

## Rollback Plan

- [ ] Keep last known-good commit SHA documented before deployment.
- [ ] If incident occurs:
  - [ ] Re-deploy previous SHA immediately.
  - [ ] Disable new release traffic.
  - [ ] Preserve local queue data (do not clear storage automatically).
  - [ ] Create postmortem issue with root cause and mitigation.

