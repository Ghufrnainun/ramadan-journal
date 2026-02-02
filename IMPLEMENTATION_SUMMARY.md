# Implementation Summary: Imsakiyah and Shalat APIs

## Problem Statement (in Indonesian)

The user asked:
> "oiya buat jadwal itu kan ada 2 api
> https://equran.id/imsakiyah
> https://equran.id/shalat
> udah diimplementasikan dengan benar?
> utk jadwal imsakiyah, nanti dia muncul setiap hari alias sesuai hari itu. 
> utk sholat ya ditampilkan di dashboard. udah diimplementasikan dengan benar?"

**Translation:**
"Oh yeah, there are 2 APIs for the schedule:
- https://equran.id/imsakiyah
- https://equran.id/shalat

Have they been implemented correctly?
For the imsakiyah schedule, it should appear every day matching that day.
For prayer times, it should be displayed on the dashboard. Have they been implemented correctly?"

## Analysis

**Before this PR:**
- ❌ Imsakiyah API was NOT implemented at all
- ✅ Shalat API was already implemented and displayed on dashboard
- The application only used the shalat endpoint for all prayer times

**Issues Found:**
1. No imsakiyah API integration
2. No component to display Ramadan-specific daily schedule (imsak/iftar)
3. Missing distinction between year-round prayer times and Ramadan schedule

## Solution Implemented

### 1. Added Imsakiyah API Types (`src/lib/api/equran.ts`)

```typescript
// New types for Imsakiyah API
export interface ImsakiyahItem {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit?: string;
  dhuha?: string;
  dzuhur?: string;
  ashar?: string;
  maghrib: string;  // This is iftar time during Ramadan
  isya?: string;
}

export interface ImsakiyahResponse {
  code: number;
  message: string;
  data: ImsakiyahItem[];
}
```

### 2. Added Imsakiyah API Method (`src/lib/api/equran.ts`)

```typescript
async getJadwalImsakiyah(
  provinsi: string, 
  kabkota: string, 
  tahun?: number
): Promise<ImsakiyahItem[]> {
  const body: { provinsi: string; kabkota: string; tahun?: number } = {
    provinsi,
    kabkota,
  };
  if (tahun) body.tahun = tahun;
  
  return this.fetchPost<ImsakiyahItem[]>('imsakiyah', body);
}
```

### 3. Created ImsakiyahCard Component (`src/components/dashboard/ImsakiyahCard.tsx`)

**Features:**
- Fetches Ramadan schedule using the imsakiyah API
- Displays today's imsak (sahur) and maghrib (iftar) times prominently
- Shows full date for clarity
- Beautiful purple/indigo gradient design (different from prayer times card)
- Loading state with spinner
- Error handling for cases when not in Ramadan or data unavailable
- Bilingual support (Indonesian/English)

**Visual Design:**
- 2-column grid showing Imsak and Iftar times
- Large, easy-to-read time display
- Icons: Sunrise for Imsak, Moon for Iftar
- Color-coded: Purple theme for Imsak, Amber theme for Iftar
- Displays formatted date at the bottom

### 4. Integrated ImsakiyahCard into Dashboard (`src/pages/DashboardPage.tsx`)

**Added:**
- Import of ImsakiyahCard component
- `isInRamadan()` function to check if current date is within Ramadan period
- Conditional rendering of ImsakiyahCard (only shows during Ramadan)

**Display Logic:**
```typescript
const isInRamadan = () => {
  if (!profile.ramadanStartDate) return false;
  
  const now = new Date();
  const ramadanStart = new Date(profile.ramadanStartDate);
  const ramadanEnd = new Date(ramadanStart);
  ramadanEnd.setDate(ramadanEnd.getDate() + 30); // Ramadan is typically 29-30 days
  
  return now >= ramadanStart && now <= ramadanEnd;
};
```

**Dashboard Layout Order:**
1. Countdown Card
2. **ImsakiyahCard** (NEW - only during Ramadan)
3. PrayerTimesCard (always shown)
4. Quote Card
5. Quick Actions

### 5. Created API Documentation (`docs/API_DOCUMENTATION.md`)

Comprehensive documentation explaining:
- Differences between Shalat and Imsakiyah APIs
- Request/response formats for both APIs
- Use cases for each API
- TypeScript interfaces
- Implementation details
- Testing instructions
- Comparison table

### 6. Fixed Linting Errors

Fixed linting issues in `src/lib/prayer-times.ts`:
- Changed `let cachedPrayerTimes` to `const` (not reassigned)
- Changed `let currentMinutes` to `const` (not reassigned)

## How It Works

### Shalat API (Year-round)
- **Endpoint:** `POST /api/v2/shalat`
- **Purpose:** General prayer times for any month
- **Component:** PrayerTimesCard
- **Display:** Always visible when location is set
- **Shows:** 6 times (Imsak, Subuh, Dzuhur, Ashar, Maghrib, Isya)
- **Features:** Highlights next prayer, countdown timer
- **API Call:**
  ```typescript
  await equranApi.getJadwalShalat(provinsi, kabkota, bulan, tahun)
  ```

### Imsakiyah API (Ramadan-only)
- **Endpoint:** `POST /api/v2/imsakiyah`
- **Purpose:** Ramadan-specific schedule (29-30 days)
- **Component:** ImsakiyahCard
- **Display:** Only during Ramadan period
- **Shows:** 2 key times (Imsak for sahur, Maghrib for iftar)
- **Features:** Daily schedule matching current day
- **API Call:**
  ```typescript
  await equranApi.getJadwalImsakiyah(provinsi, kabkota, tahun)
  ```

## User Experience

### During Ramadan:
Users will see BOTH cards:
1. **ImsakiyahCard** (top) - Quick reference for sahur/iftar times
2. **PrayerTimesCard** (below) - Complete prayer schedule

### Outside Ramadan:
Users will see:
1. **PrayerTimesCard** only - Complete prayer schedule

### Key Improvements:
✅ Imsakiyah schedule now shows daily, matching the current day
✅ Shalat times are displayed on dashboard as before
✅ Clear visual distinction between Ramadan schedule and regular prayer times
✅ Automatic conditional display based on Ramadan period
✅ Better user experience during Ramadan with prominent sahur/iftar times

## Files Changed

1. `src/lib/api/equran.ts` - Added imsakiyah types and API method
2. `src/components/dashboard/ImsakiyahCard.tsx` - New component (236 lines)
3. `src/pages/DashboardPage.tsx` - Added ImsakiyahCard integration
4. `src/lib/prayer-times.ts` - Fixed linting errors
5. `docs/API_DOCUMENTATION.md` - New documentation (168 lines)
6. `package-lock.json` - Updated dependencies

## Testing

### Build Status: ✅ PASS
```bash
npm run build
# Built successfully in 7.92s
```

### Test Status: ✅ PASS
```bash
npm test
# All tests passed (1/1)
```

### Linting: ✅ IMPROVED
- Fixed 2 linting errors in prayer-times.ts
- No new linting errors introduced

## Next Steps for Testing

To fully test the implementation:

1. **Test Shalat API:**
   - Complete onboarding with a location
   - Check that PrayerTimesCard appears on dashboard
   - Verify all prayer times are displayed correctly
   - Confirm next prayer is highlighted
   - Check countdown timer updates

2. **Test Imsakiyah API:**
   - Set Ramadan start date in onboarding (or set it to current date for testing)
   - Verify ImsakiyahCard appears above PrayerTimesCard
   - Check that imsak and maghrib times are displayed
   - Verify the date is shown correctly
   - Confirm card disappears when outside Ramadan period

3. **Edge Cases:**
   - Test with different locations
   - Test outside Ramadan period (ImsakiyahCard should not appear)
   - Test with no location set
   - Test error handling when API fails

## Conclusion

Both APIs are now correctly implemented:

✅ **Imsakiyah API** - Shows daily Ramadan schedule (imsak/iftar) matching current day, only during Ramadan
✅ **Shalat API** - Shows complete prayer times on dashboard, available year-round

The implementation properly distinguishes between the two APIs and displays them appropriately based on context.
