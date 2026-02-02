/**
 * Ramadan Dates Utility
 * Manages Islamic calendar dates for Ramadan countdown and status
 */

// Ramadan dates from 2025-2030 (estimated based on Islamic lunar calendar)
// Note: Actual dates may vary by 1-2 days based on moon sighting
const RAMADAN_DATES: { year: number; start: string; end: string }[] = [
  { year: 2025, start: '2025-03-01', end: '2025-03-30' },
  { year: 2026, start: '2026-02-18', end: '2026-03-19' },
  { year: 2027, start: '2027-02-08', end: '2027-03-09' },
  { year: 2028, start: '2028-01-28', end: '2028-02-26' },
  { year: 2029, start: '2029-01-16', end: '2029-02-14' },
  { year: 2030, start: '2030-01-06', end: '2030-02-04' },
];

// How many days after Ramadan to still show "Selamat Idul Fitri"
const EID_GRACE_PERIOD_DAYS = 7;

export type RamadanStatus = 'before' | 'during' | 'after-eid' | 'normal';

export interface RamadanInfo {
  status: RamadanStatus;
  currentDay?: number; // Day of Ramadan if during
  daysRemaining?: number; // Days remaining in Ramadan if during
  countdown?: { days: number; hours: number; minutes: number; seconds: number }; // If before
  nextRamadan?: { start: Date; end: Date }; // Next Ramadan dates
}

/**
 * Get the next upcoming Ramadan dates relative to the given date
 */
export const getNextRamadan = (
  from: Date = new Date(),
): { start: Date; end: Date } | null => {
  for (const ramadan of RAMADAN_DATES) {
    const endDate = new Date(ramadan.end);
    // Add grace period for Eid
    endDate.setDate(endDate.getDate() + EID_GRACE_PERIOD_DAYS);

    if (from <= endDate) {
      return {
        start: new Date(ramadan.start),
        end: new Date(ramadan.end),
      };
    }
  }
  return null;
};

/**
 * Get current Ramadan info based on date
 */
export const getRamadanInfo = (now: Date = new Date()): RamadanInfo => {
  const ramadan = getNextRamadan(now);

  if (!ramadan) {
    return { status: 'normal' };
  }

  const { start, end } = ramadan;
  const eidEnd = new Date(end);
  eidEnd.setDate(eidEnd.getDate() + EID_GRACE_PERIOD_DAYS);

  // During Ramadan
  if (now >= start && now <= end) {
    const diffFromStart = now.getTime() - start.getTime();
    const currentDay = Math.floor(diffFromStart / (1000 * 60 * 60 * 24)) + 1;
    const totalDays =
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      status: 'during',
      currentDay,
      daysRemaining: totalDays - currentDay,
      nextRamadan: ramadan,
    };
  }

  // After Ramadan but within Eid grace period
  if (now > end && now <= eidEnd) {
    return {
      status: 'after-eid',
      nextRamadan: ramadan,
    };
  }

  // Before Ramadan - show countdown
  const diffToStart = start.getTime() - now.getTime();
  if (diffToStart > 0) {
    const days = Math.floor(diffToStart / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffToStart % (1000 * 60)) / 1000);

    return {
      status: 'before',
      countdown: { days, hours, minutes, seconds },
      nextRamadan: ramadan,
    };
  }

  return { status: 'normal' };
};

/**
 * Get greeting text based on Ramadan status
 */
export const getRamadanGreeting = (
  lang: 'id' | 'en',
  status: RamadanStatus,
): { greeting: string; subtitle: string } => {
  const greetings = {
    id: {
      before: {
        greeting: 'Menanti Ramadan',
        subtitle: 'Persiapkan diri untuk bulan suci',
      },
      during: {
        greeting: 'Marhaban ya Ramadan',
        subtitle: 'Selamat menjalankan ibadah',
      },
      'after-eid': {
        greeting: 'Selamat Idul Fitri',
        subtitle: 'Mohon maaf lahir dan batin',
      },
      normal: { greeting: "Assalamu'alaikum", subtitle: 'Selamat beribadah' },
    },
    en: {
      before: {
        greeting: 'Awaiting Ramadan',
        subtitle: 'Prepare yourself for the holy month',
      },
      during: {
        greeting: 'Welcome to Ramadan',
        subtitle: 'May your worship be accepted',
      },
      'after-eid': {
        greeting: 'Eid Mubarak',
        subtitle: 'Blessed celebration to you',
      },
      normal: {
        greeting: 'Peace be upon you',
        subtitle: 'May your worship be blessed',
      },
    },
  };

  return greetings[lang][status];
};
