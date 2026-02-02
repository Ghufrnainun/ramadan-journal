/**
 * Prayer Times using equran.id API
 * Provides prayer schedule for Indonesian cities
 */

import { equranApi, JadwalShalatItem } from '@/lib/api/equran';

export interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

// Cache for prayer times
const cachedPrayerTimes: {
  [key: string]: { times: PrayerTimes; date: string };
} = {};

// Province mapping for common cities
const CITY_PROVINCE_MAP: Record<string, { provinsi: string; kabkota: string }> =
  {
    Jakarta: { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta Pusat' },
    Surabaya: { provinsi: 'Jawa Timur', kabkota: 'Kota Surabaya' },
    Bandung: { provinsi: 'Jawa Barat', kabkota: 'Kota Bandung' },
    Medan: { provinsi: 'Sumatera Utara', kabkota: 'Kota Medan' },
    Semarang: { provinsi: 'Jawa Tengah', kabkota: 'Kota Semarang' },
    Makassar: { provinsi: 'Sulawesi Selatan', kabkota: 'Kota Makassar' },
    Palembang: { provinsi: 'Sumatera Selatan', kabkota: 'Kota Palembang' },
    Yogyakarta: { provinsi: 'DI Yogyakarta', kabkota: 'Kota Yogyakarta' },
    Denpasar: { provinsi: 'Bali', kabkota: 'Kota Denpasar' },
    Malang: { provinsi: 'Jawa Timur', kabkota: 'Kota Malang' },
    Bekasi: { provinsi: 'Jawa Barat', kabkota: 'Kota Bekasi' },
    Tangerang: { provinsi: 'Banten', kabkota: 'Kota Tangerang' },
    Depok: { provinsi: 'Jawa Barat', kabkota: 'Kota Depok' },
    Bogor: { provinsi: 'Jawa Barat', kabkota: 'Kota Bogor' },
  };

/**
 * Get province and city mapping
 */
export const getCityMapping = (
  cityName: string,
): { provinsi: string; kabkota: string } => {
  // Check direct mapping
  for (const [key, value] of Object.entries(CITY_PROVINCE_MAP)) {
    if (
      cityName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(cityName.toLowerCase())
    ) {
      return value;
    }
  }
  // Default to Jakarta
  return CITY_PROVINCE_MAP['Jakarta'];
};

/**
 * Get prayer times from API
 */
export const getPrayerTimesFromApi = async (
  city: string,
  date: Date = new Date(),
): Promise<PrayerTimes> => {
  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `${city}-${dateStr}`;

  // Check cache
  if (
    cachedPrayerTimes[cacheKey] &&
    cachedPrayerTimes[cacheKey].date === dateStr
  ) {
    return cachedPrayerTimes[cacheKey].times;
  }

  try {
    const mapping = getCityMapping(city);
    const bulan = date.getMonth() + 1;
    const tahun = date.getFullYear();
    const hari = date.getDate();

    const jadwalList = await equranApi.getJadwalShalat(
      mapping.provinsi,
      mapping.kabkota,
      bulan,
      tahun,
    );

    // Find today's schedule
    const todayJadwal =
      jadwalList.find((j) => {
        const jadwalDate = new Date(j.tanggal);
        return jadwalDate.getDate() === hari;
      }) || jadwalList[0];

    if (!todayJadwal) {
      return getFallbackPrayerTimes();
    }

    const times: PrayerTimes = {
      imsak: todayJadwal.imsak,
      subuh: todayJadwal.subuh,
      terbit: todayJadwal.terbit,
      dhuha: todayJadwal.dhuha,
      dzuhur: todayJadwal.dzuhur,
      ashar: todayJadwal.ashar,
      maghrib: todayJadwal.maghrib,
      isya: todayJadwal.isya,
    };

    // Cache the result
    cachedPrayerTimes[cacheKey] = { times, date: dateStr };

    return times;
  } catch (error) {
    console.error('Failed to fetch prayer times:', error);
    // Return fallback times
    return getFallbackPrayerTimes();
  }
};

/**
 * Fallback prayer times (Jakarta average)
 */
const getFallbackPrayerTimes = (): PrayerTimes => ({
  imsak: '04:20',
  subuh: '04:30',
  terbit: '05:50',
  dhuha: '06:15',
  dzuhur: '12:05',
  ashar: '15:20',
  maghrib: '18:05',
  isya: '19:15',
});

/**
 * Get prayer times (sync version with fallback)
 * For backward compatibility
 */
export const getPrayerTimes = (
  city: string,
  date: Date = new Date(),
): PrayerTimes => {
  // This returns fallback times for sync usage
  // Components should use getPrayerTimesFromApi for real data
  return getFallbackPrayerTimes();
};

/**
 * Get current prayer and next prayer
 */
export const getCurrentPrayer = (
  prayerTimes: PrayerTimes,
): { current: string; next: string; nextTime: string } => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const prayers = [
    { name: 'Subuh', time: prayerTimes.subuh },
    { name: 'Dzuhur', time: prayerTimes.dzuhur },
    { name: 'Ashar', time: prayerTimes.ashar },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isya', time: prayerTimes.isya },
  ];

  for (let i = 0; i < prayers.length; i++) {
    if (currentMinutes < timeToMinutes(prayers[i].time)) {
      return {
        current: i === 0 ? 'Isya' : prayers[i - 1].name,
        next: prayers[i].name,
        nextTime: prayers[i].time,
      };
    }
  }

  // After Isya, next is Subuh tomorrow
  return {
    current: 'Isya',
    next: 'Subuh',
    nextTime: prayerTimes.subuh,
  };
};

/**
 * Format time remaining until next prayer
 */
export const getTimeUntilNext = (nextTime: string): string => {
  const now = new Date();
  const [hours, minutes] = nextTime.split(':').map(Number);

  let targetMinutes = hours * 60 + minutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // If next prayer is tomorrow (Subuh after Isya)
  if (targetMinutes < currentMinutes) {
    targetMinutes += 24 * 60;
  }

  const diff = targetMinutes - currentMinutes;
  const h = Math.floor(diff / 60);
  const m = diff % 60;

  if (h > 0) {
    return `${h}j ${m}m`;
  }
  return `${m} menit`;
};
