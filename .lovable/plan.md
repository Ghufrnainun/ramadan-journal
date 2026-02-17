

## Fix: Dashboard Countdown Ignores User's Custom Ramadan Dates

### Problem
The countdown card and greeting on the dashboard always use hardcoded Ramadan dates (Feb 18, 2026) from `src/lib/ramadan-dates.ts`. When a user changes the Ramadan start/end date in Settings, the dashboard does not reflect the change because `getRamadanInfo()` never receives the user's custom dates.

### Solution
Pass the user's custom `ramadanStartDate` and `ramadanEndDate` from their profile into the Ramadan date functions so they take priority over the hardcoded defaults.

### Changes

**1. `src/lib/ramadan-dates.ts`** - Update `getRamadanInfo()` and `getNextRamadan()` to accept optional custom start/end dates:
- Add optional parameters: `customStart?: string`, `customEnd?: string`
- When provided, use these dates instead of the hardcoded `RAMADAN_DATES` array
- Fall back to hardcoded dates when no custom dates are set

**2. `src/pages/DashboardPage.tsx`** - Pass profile dates to `getRamadanInfo()`:
- Change `getRamadanInfo()` call to `getRamadanInfo(new Date(), profile.ramadanStartDate, profile.ramadanEndDate)`
- This ensures the greeting text updates based on the user's custom dates

**3. `src/components/dashboard/CountdownCard.tsx`** - Accept and use custom dates:
- Add `ramadanStartDate` and `ramadanEndDate` props
- Pass them through to `getRamadanInfo()` inside the component's `useEffect` interval

### Technical Detail

```text
Current flow:
  Settings saves ramadanStartDate -> profile
  Dashboard reads profile -> ignores ramadanStartDate
  CountdownCard -> calls getRamadanInfo() with no args -> uses hardcoded Feb 18

Fixed flow:
  Settings saves ramadanStartDate -> profile
  Dashboard reads profile -> passes dates to CountdownCard
  CountdownCard -> calls getRamadanInfo(now, customStart, customEnd) -> uses user's dates
```

### Files to modify
- `src/lib/ramadan-dates.ts` (add custom date parameters)
- `src/components/dashboard/CountdownCard.tsx` (accept + pass custom dates)
- `src/pages/DashboardPage.tsx` (pass profile dates to CountdownCard and greeting)

