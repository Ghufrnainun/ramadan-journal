# API Documentation: Imsakiyah vs Shalat

This document explains the difference between the two eQuran.id APIs used in this application.

## 1. Shalat API (`/api/v2/shalat`)

**Purpose**: Provides general prayer times for any month throughout the year.

**Endpoint**: `POST https://equran.id/api/v2/shalat`

**Request Body**:
```json
{
  "provinsi": "DKI Jakarta",
  "kabkota": "Kota Jakarta Pusat",
  "bulan": 2,      // Optional: month (1-12)
  "tahun": 2026    // Optional: year
}
```

**Response**: Returns an array of `JadwalShalatItem[]` with daily prayer times for the entire month:
```typescript
interface JadwalShalatItem {
  tanggal: string;  // Date in ISO format
  imsak: string;    // Imsak time (HH:MM)
  subuh: string;    // Fajr prayer time
  terbit: string;   // Sunrise
  dhuha: string;    // Dhuha prayer time
  dzuhur: string;   // Dhuhr prayer time
  ashar: string;    // Asr prayer time
  maghrib: string;  // Maghrib prayer time
  isya: string;     // Isha prayer time
}
```

**Use Case**:
- Display on dashboard for year-round prayer times
- Shows all 5 daily prayers (Subuh, Dzuhur, Ashar, Maghrib, Isya)
- Used by `PrayerTimesCard` component
- Available all year

**Implementation**:
- File: `src/lib/api/equran.ts` → `getJadwalShalat()`
- Component: `src/components/dashboard/PrayerTimesCard.tsx`
- Usage: Always displayed on dashboard when location is set

---

## 2. Imsakiyah API (`/api/v2/imsakiyah`)

**Purpose**: Provides Ramadan-specific schedule with imsak and iftar (maghrib) times.

**Endpoint**: `POST https://equran.id/api/v2/imsakiyah`

**Request Body**:
```json
{
  "provinsi": "DKI Jakarta",
  "kabkota": "Kota Jakarta Pusat",
  "tahun": 2026    // Optional: year (defaults to current year)
}
```

**Response**: Returns an array of `ImsakiyahItem[]` with daily Ramadan schedule (typically 29-30 days):
```typescript
interface ImsakiyahItem {
  tanggal: string;  // Date in ISO format
  imsak: string;    // Time to stop eating/drinking (HH:MM)
  subuh: string;    // Fajr prayer time
  maghrib: string;  // Iftar time (breaking fast)
  // May include other prayer times optionally
}
```

**Use Case**:
- Display during Ramadan month only
- Focuses on 2 key times: Imsak (sahur) and Maghrib (iftar)
- Used by `ImsakiyahCard` component
- Only relevant during Ramadan

**Implementation**:
- File: `src/lib/api/equran.ts` → `getJadwalImsakiyah()`
- Component: `src/components/dashboard/ImsakiyahCard.tsx`
- Usage: Conditionally displayed on dashboard only when:
  1. Location is set
  2. Current date is within Ramadan period (based on `profile.ramadanStartDate`)

---

## Key Differences

| Feature | Shalat API | Imsakiyah API |
|---------|-----------|---------------|
| **Availability** | Year-round | Ramadan only (29-30 days) |
| **Scope** | Monthly schedule | Ramadan-specific |
| **Primary Focus** | 5 daily prayers | Imsak & Iftar times |
| **Request Param** | Month & Year | Year only |
| **Display** | Always on dashboard | Conditional (Ramadan period) |
| **Component** | PrayerTimesCard | ImsakiyahCard |
| **Visual Style** | Slate/amber theme | Purple/indigo theme |

---

## Display Logic

**PrayerTimesCard** (Shalat):
- Always visible when location is set
- Shows 6 times: Imsak, Subuh, Dzuhur, Ashar, Maghrib, Isya
- Highlights next prayer
- Updates countdown every minute

**ImsakiyahCard** (Imsakiyah):
- Only visible during Ramadan period
- Shows 2 key times: Imsak (sahur) and Maghrib (iftar)
- Large, prominent display for easy reference
- Displays current date

Both cards complement each other during Ramadan:
1. ImsakiyahCard → Quick view for sahur/iftar
2. PrayerTimesCard → Complete prayer schedule

---

## Example Usage

```typescript
import { equranApi } from '@/lib/api/equran';

// Get general prayer times (any month)
const prayerTimes = await equranApi.getJadwalShalat(
  'DKI Jakarta',
  'Kota Jakarta Pusat',
  2,     // February
  2026
);

// Get Ramadan schedule
const imsakiyah = await equranApi.getJadwalImsakiyah(
  'DKI Jakarta',
  'Kota Jakarta Pusat',
  2026
);

// Find today's schedule
const today = new Date().toISOString().split('T')[0];
const todayPrayer = prayerTimes.find(item => 
  new Date(item.tanggal).toISOString().split('T')[0] === today
);
const todayImsakiyah = imsakiyah.find(item => 
  new Date(item.tanggal).toISOString().split('T')[0] === today
);
```

---

## Testing

To test the implementations:

1. **Shalat API**: Set your location in onboarding → Check PrayerTimesCard on dashboard
2. **Imsakiyah API**: 
   - Set Ramadan start date in onboarding
   - Ensure current date is within Ramadan period
   - Check ImsakiyahCard appears on dashboard above PrayerTimesCard
