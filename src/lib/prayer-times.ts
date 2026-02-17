/**
 * Prayer Times using equran.id API
 * Provides prayer schedule for Indonesian cities
 */

import { equranApi, JadwalShalatItem } from '@/lib/api/equran';
import { getLocalDateKey } from '@/lib/date';

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
const prayerCacheOrder: string[] = [];
const PRAYER_CACHE_MAX_ENTRIES = 14;

const setPrayerTimesCache = (
  cacheKey: string,
  cacheValue: { times: PrayerTimes; date: string },
) => {
  if (!cachedPrayerTimes[cacheKey]) {
    prayerCacheOrder.push(cacheKey);
  } else {
    const existingKeyIndex = prayerCacheOrder.indexOf(cacheKey);
    if (existingKeyIndex !== -1) {
      prayerCacheOrder.splice(existingKeyIndex, 1);
      prayerCacheOrder.push(cacheKey);
    }
  }

  cachedPrayerTimes[cacheKey] = cacheValue;

  while (prayerCacheOrder.length > PRAYER_CACHE_MAX_ENTRIES) {
    const oldestKey = prayerCacheOrder.shift();
    if (!oldestKey) break;
    delete cachedPrayerTimes[oldestKey];
  }
};

// Province mapping for common cities
const CITY_PROVINCE_MAP: Record<string, { provinsi: string; kabkota: string }> =
  {
    Jakarta: { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Jakarta Pusat': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Jakarta Selatan': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Jakarta Barat': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Jakarta Timur': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Jakarta Utara': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Kota Jakarta': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Kota Jakarta Pusat': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Kota Jakarta Selatan': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Kota Jakarta Barat': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Kota Jakarta Timur': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    'Kota Jakarta Utara': { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' },
    Surabaya: { provinsi: 'Jawa Timur', kabkota: 'Kota Surabaya' },
    Bandung: { provinsi: 'Jawa Barat', kabkota: 'Kota Bandung' },
    Medan: { provinsi: 'Sumatera Utara', kabkota: 'Kota Medan' },
    Semarang: { provinsi: 'Jawa Tengah', kabkota: 'Kota Semarang' },
    Solo: { provinsi: 'Jawa Tengah', kabkota: 'Kota Surakarta' },
    Purwokerto: { provinsi: 'Jawa Tengah', kabkota: 'Kab. Banyumas' },
    Makassar: { provinsi: 'Sulawesi Selatan', kabkota: 'Kota Makassar' },
    Palembang: { provinsi: 'Sumatera Selatan', kabkota: 'Kota Palembang' },
    Yogyakarta: { provinsi: 'D.I. Yogyakarta', kabkota: 'Kota Yogyakarta' },
    Denpasar: { provinsi: 'Bali', kabkota: 'Kota Denpasar' },
    Malang: { provinsi: 'Jawa Timur', kabkota: 'Kota Malang' },
    Bekasi: { provinsi: 'Jawa Barat', kabkota: 'Kota Bekasi' },
    Tangerang: { provinsi: 'Banten', kabkota: 'Kota Tangerang' },
    Depok: { provinsi: 'Jawa Barat', kabkota: 'Kota Depok' },
    Bogor: { provinsi: 'Jawa Barat', kabkota: 'Kota Bogor' },
  };

const PROVINCE_ALIASES: Record<string, string> = {
  'DI Yogyakarta': 'D.I. Yogyakarta',
  'Daerah Istimewa Yogyakarta': 'D.I. Yogyakarta',
};

const kabkotaCache: Record<string, string[]> = {};
const resolvedCityCache: Record<string, { provinsi: string; kabkota: string }> = {};

const normalizeName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/^kab\s*/g, '')
    .replace(/^kabupaten\s*/g, '')
    .replace(/^kota\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeProvince = (province?: string): string | null => {
  if (!province) return null;
  return PROVINCE_ALIASES[province] || province;
};

const pickBestKabkotaCandidate = (
  cityName: string,
  candidates: string[],
): string | null => {
  const normalizedCity = normalizeName(cityName);
  if (!normalizedCity) return null;

  const exact = candidates.find(
    (candidate) => normalizeName(candidate) === normalizedCity,
  );
  if (exact) return exact;

  const contains = candidates.filter((candidate) => {
    const normalizedCandidate = normalizeName(candidate);
    return (
      normalizedCandidate.includes(normalizedCity) ||
      normalizedCity.includes(normalizedCandidate)
    );
  });
  if (contains.length > 0) {
    return contains.sort((a, b) => a.length - b.length)[0];
  }

  return null;
};

const getKabkotaByProvince = async (province: string): Promise<string[]> => {
  if (kabkotaCache[province]) return kabkotaCache[province];
  const list = await equranApi.getKabKota(province);
  kabkotaCache[province] = list;
  return list;
};

/**
 * Get province and city mapping
 */
export const getCityMapping = (
  cityName: string,
  province?: string,
): { provinsi: string; kabkota: string } => {
  const canonicalProvince = normalizeProvince(province);

  if (canonicalProvince) {
    const exactMatch = Object.entries(CITY_PROVINCE_MAP).find(
      ([key]) =>
        cityName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(cityName.toLowerCase()),
    );
    if (exactMatch) {
      return {
        provinsi: canonicalProvince,
        kabkota: exactMatch[1].kabkota,
      };
    }
  }

  // Check direct mapping
  for (const [key, value] of Object.entries(CITY_PROVINCE_MAP)) {
    if (
      cityName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(cityName.toLowerCase())
    ) {
      if (canonicalProvince) {
        return { provinsi: canonicalProvince, kabkota: value.kabkota };
      }
      return value;
    }
  }

  if (canonicalProvince) {
    return { provinsi: canonicalProvince, kabkota: cityName };
  }

  // Default to Jakarta
  return CITY_PROVINCE_MAP['Jakarta'];
};

export const resolveCityMapping = async (
  cityName: string,
  province?: string,
): Promise<{ provinsi: string; kabkota: string }> => {
  const cacheKey = `${province || ''}|${cityName}`;
  if (resolvedCityCache[cacheKey]) return resolvedCityCache[cacheKey];

  const fallback = getCityMapping(cityName, province);
  const candidateProvinces = Array.from(
    new Set(
      [normalizeProvince(province), normalizeProvince(fallback.provinsi)].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  for (const candidateProvince of candidateProvinces) {
    try {
      const kabkotaList = await getKabkotaByProvince(candidateProvince);
      const bestCandidate = pickBestKabkotaCandidate(cityName, kabkotaList);
      if (bestCandidate) {
        const resolved = {
          provinsi: candidateProvince,
          kabkota: bestCandidate,
        };
        resolvedCityCache[cacheKey] = resolved;
        return resolved;
      }

      if (kabkotaList.includes(fallback.kabkota)) {
        const resolved = {
          provinsi: candidateProvince,
          kabkota: fallback.kabkota,
        };
        resolvedCityCache[cacheKey] = resolved;
        return resolved;
      }
    } catch (error) {
      console.error('Failed to resolve kabkota list:', error);
    }
  }

  resolvedCityCache[cacheKey] = fallback;
  return fallback;
};

/**
 * Get prayer times from API
 */
export const getPrayerTimesFromApi = async (
  city: string,
  date: Date = new Date(),
  province?: string,
): Promise<PrayerTimes> => {
  const dateStr = getLocalDateKey(date);
  const cacheKey = `${province || ''}-${city}-${dateStr}`;

  // Check cache
  if (
    cachedPrayerTimes[cacheKey] &&
    cachedPrayerTimes[cacheKey].date === dateStr
  ) {
    const existingKeyIndex = prayerCacheOrder.indexOf(cacheKey);
    if (existingKeyIndex !== -1) {
      prayerCacheOrder.splice(existingKeyIndex, 1);
      prayerCacheOrder.push(cacheKey);
    }
    return cachedPrayerTimes[cacheKey].times;
  }

  try {
    const mapping = await resolveCityMapping(city, province);
    const bulan = date.getMonth() + 1;
    const tahun = date.getFullYear();
    const jadwalList = await equranApi.getJadwalShalat(
      mapping.provinsi,
      mapping.kabkota,
      bulan,
      tahun,
    );

    // Find today's schedule
    const todayJadwal = jadwalList.find((j) => j.tanggal === dateStr) || jadwalList[0];

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
    setPrayerTimesCache(cacheKey, { times, date: dateStr });

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
