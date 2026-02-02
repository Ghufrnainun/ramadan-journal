import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PrayerTimes, 
  getPrayerTimesFromApi, 
  getCurrentPrayer, 
  getTimeUntilNext, 
  getPrayerTimes as getFallbackTimes
} from '@/lib/prayer-times';

interface PrayerTimesCardProps {
  lang: 'id' | 'en';
  city: string;
}

const content = {
  id: {
    title: 'Jadwal Sholat',
    imsak: 'Imsak',
    subuh: 'Subuh',
    terbit: 'Terbit',
    dhuha: 'Dhuha',
    dzuhur: 'Dzuhur',
    ashar: 'Ashar',
    maghrib: 'Maghrib',
    isya: 'Isya',
    next: 'Selanjutnya',
    in: 'dalam',
    loading: 'Memuat...',
  },
  en: {
    title: 'Prayer Times',
    imsak: 'Imsak',
    subuh: 'Fajr',
    terbit: 'Sunrise',
    dhuha: 'Dhuha',
    dzuhur: 'Dhuhr',
    ashar: 'Asr',
    maghrib: 'Maghrib',
    isya: 'Isha',
    next: 'Next',
    in: 'in',
    loading: 'Loading...',
  },
};

const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({ lang, city }) => {
  const t = content[lang];
  const [times, setTimes] = useState<PrayerTimes>(() => getFallbackTimes(city));
  const [currentPrayer, setCurrentPrayer] = useState(() => getCurrentPrayer(times));
  const [timeUntil, setTimeUntil] = useState(() => getTimeUntilNext(currentPrayer.nextTime));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch prayer times from API
  useEffect(() => {
    const loadPrayerTimes = async () => {
      setIsLoading(true);
      try {
        const newTimes = await getPrayerTimesFromApi(city);
        setTimes(newTimes);
        setCurrentPrayer(getCurrentPrayer(newTimes));
      } catch (error) {
        console.error('Failed to load prayer times:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrayerTimes();
  }, [city]);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getCurrentPrayer(times);
      setCurrentPrayer(current);
      setTimeUntil(getTimeUntilNext(current.nextTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [times]);

  // Update timeUntil when times change
  useEffect(() => {
    const current = getCurrentPrayer(times);
    setCurrentPrayer(current);
    setTimeUntil(getTimeUntilNext(current.nextTime));
  }, [times]);

  const prayers = [
    { key: 'imsak', name: t.imsak, time: times.imsak, highlight: false },
    { key: 'subuh', name: t.subuh, time: times.subuh, highlight: currentPrayer.next === 'Subuh' },
    { key: 'dzuhur', name: t.dzuhur, time: times.dzuhur, highlight: currentPrayer.next === 'Dzuhur' },
    { key: 'ashar', name: t.ashar, time: times.ashar, highlight: currentPrayer.next === 'Ashar' },
    { key: 'maghrib', name: t.maghrib, time: times.maghrib, highlight: currentPrayer.next === 'Maghrib' },
    { key: 'isya', name: t.isya, time: times.isya, highlight: currentPrayer.next === 'Isya' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              {t.title}
            </CardTitle>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <div className="text-xs text-slate-400">
                {t.next}: <span className="text-amber-400">{currentPrayer.next}</span>{' '}
                <span className="text-slate-500">{t.in} {timeUntil}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2">
            {prayers.map((prayer) => (
              <div
                key={prayer.key}
                className={`rounded-xl p-3 text-center transition-all ${
                  prayer.highlight
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-slate-800/50'
                }`}
              >
                <p className={`text-xs ${prayer.highlight ? 'text-amber-400' : 'text-slate-400'}`}>
                  {prayer.name}
                </p>
                <p className={`text-lg font-medium mt-1 ${prayer.highlight ? 'text-white' : 'text-slate-200'}`}>
                  {prayer.time}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrayerTimesCard;
