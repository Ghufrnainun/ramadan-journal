/**
 * Prayer Times Calculation
 * Simplified calculation for Indonesian cities
 * Based on approximate coordinates and standard calculation methods
 */

interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

// Approximate coordinates for major Indonesian cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Jakarta': { lat: -6.2088, lng: 106.8456 },
  'Surabaya': { lat: -7.2575, lng: 112.7521 },
  'Bandung': { lat: -6.9175, lng: 107.6191 },
  'Medan': { lat: 3.5952, lng: 98.6722 },
  'Semarang': { lat: -6.9666, lng: 110.4196 },
  'Makassar': { lat: -5.1477, lng: 119.4327 },
  'Palembang': { lat: -2.9761, lng: 104.7754 },
  'Yogyakarta': { lat: -7.7956, lng: 110.3695 },
  'Denpasar': { lat: -8.6705, lng: 115.2126 },
  'Malang': { lat: -7.9666, lng: 112.6326 },
  'Bekasi': { lat: -6.2349, lng: 106.9896 },
  'Tangerang': { lat: -6.1783, lng: 106.6319 },
  'Depok': { lat: -6.4025, lng: 106.7942 },
  'Bogor': { lat: -6.5971, lng: 106.8060 },
  'Batam': { lat: 1.0456, lng: 104.0305 },
  'Pekanbaru': { lat: 0.5071, lng: 101.4478 },
  'Bandar Lampung': { lat: -5.3971, lng: 105.2663 },
  'Padang': { lat: -0.9471, lng: 100.4172 },
  'Pontianak': { lat: -0.0263, lng: 109.3425 },
  'Samarinda': { lat: -0.4948, lng: 117.1436 },
  'Balikpapan': { lat: -1.2654, lng: 116.8312 },
  'Manado': { lat: 1.4748, lng: 124.8421 },
  'Banjarmasin': { lat: -3.3194, lng: 114.5900 },
  'Serang': { lat: -6.1103, lng: 106.1503 },
  'Solo': { lat: -7.5755, lng: 110.8243 },
};

// Default coordinates (Jakarta) for cities not in the list
const DEFAULT_COORDS = { lat: -6.2088, lng: 106.8456 };

/**
 * Get coordinates for a city
 */
const getCoordinates = (city: string): { lat: number; lng: number } => {
  return CITY_COORDINATES[city] || DEFAULT_COORDS;
};

/**
 * Calculate prayer times for a given date and location
 * This is a simplified calculation - for production, use a proper library
 */
export const getPrayerTimes = (city: string, date: Date = new Date()): PrayerTimes => {
  const coords = getCoordinates(city);
  
  // Simplified calculation based on latitude
  // In production, use libraries like adhan-js for accurate calculations
  const latitudeOffset = Math.abs(coords.lat) * 0.5; // minutes adjustment
  
  // Base times for equatorial region (approximate)
  const baseSubuh = 4 * 60 + 30; // 04:30
  const baseTerbit = 5 * 60 + 45; // 05:45
  const baseDzuhur = 12 * 60 + 5; // 12:05
  const baseAshar = 15 * 60 + 15; // 15:15
  const baseMaghrib = 18 * 60 + 5; // 18:05
  const baseIsya = 19 * 60 + 15; // 19:15
  
  // Adjust based on day of year for seasonal variation
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const seasonalOffset = Math.sin((dayOfYear - 80) * 2 * Math.PI / 365) * 15; // +/- 15 minutes
  
  const formatTime = (minutes: number): string => {
    const adjustedMinutes = Math.round(minutes + latitudeOffset + seasonalOffset);
    const hours = Math.floor(adjustedMinutes / 60) % 24;
    const mins = adjustedMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  return {
    imsak: formatTime(baseSubuh - 10),
    subuh: formatTime(baseSubuh),
    terbit: formatTime(baseTerbit),
    dhuha: formatTime(baseTerbit + 20),
    dzuhur: formatTime(baseDzuhur),
    ashar: formatTime(baseAshar),
    maghrib: formatTime(baseMaghrib),
    isya: formatTime(baseIsya),
  };
};

/**
 * Get current prayer and next prayer
 */
export const getCurrentPrayer = (prayerTimes: PrayerTimes): { current: string; next: string; nextTime: string } => {
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
  let currentMinutes = now.getHours() * 60 + now.getMinutes();
  
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
