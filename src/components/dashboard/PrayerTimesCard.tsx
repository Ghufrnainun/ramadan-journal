import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Volume2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PrayerTimes,
  getPrayerTimesFromApi,
  getCurrentPrayer,
  getTimeUntilNext,
  getPrayerTimes as getFallbackTimes,
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
  const [currentPrayer, setCurrentPrayer] = useState(() =>
    getCurrentPrayer(times),
  );
  const [timeUntil, setTimeUntil] = useState(() =>
    getTimeUntilNext(currentPrayer.nextTime),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Adhan Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const toggleAdhan = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

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
    {
      key: 'subuh',
      name: t.subuh,
      time: times.subuh,
      highlight: currentPrayer.next === 'Subuh',
    },
    {
      key: 'dzuhur',
      name: t.dzuhur,
      time: times.dzuhur,
      highlight: currentPrayer.next === 'Dzuhur',
    },
    {
      key: 'ashar',
      name: t.ashar,
      time: times.ashar,
      highlight: currentPrayer.next === 'Ashar',
    },
    {
      key: 'maghrib',
      name: t.maghrib,
      time: times.maghrib,
      highlight: currentPrayer.next === 'Maghrib',
    },
    {
      key: 'isya',
      name: t.isya,
      time: times.isya,
      highlight: currentPrayer.next === 'Isya',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          {t.title}

          <button
            type="button"
            onClick={toggleAdhan}
            aria-label={isPlaying ? 'Stop adhan audio' : 'Play adhan audio'}
            className={cn(
              'ml-2 rounded-full p-1.5 transition-colors',
              isPlaying
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-amber-400',
            )}
            title="Play Adhan"
          >
            {isPlaying ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </button>
        </h3>
        {!isLoading && (
          <div className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700/50">
            {t.next}{' '}
            <span className="text-amber-400 font-medium">
              {currentPrayer.next}
            </span>{' '}
            <span className="text-slate-500 mx-1">•</span> {timeUntil}
          </div>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0">
        {prayers.map((prayer) => (
          <div
            key={prayer.key}
            className={cn(
              'group relative min-w-[100px] flex-shrink-0 overflow-hidden rounded-2xl border p-4 transition-colors md:min-w-0',
              prayer.highlight
                ? 'border-amber-400 bg-amber-500/20 shadow-lg'
                : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/60',
            )}
          >
            {prayer.highlight && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            )}

            <p
              className={cn(
                'mb-1 text-xs font-medium uppercase',
                prayer.highlight
                  ? 'text-amber-100'
                  : 'text-slate-500 group-hover:text-slate-400',
              )}
            >
              {prayer.name}
            </p>
            <p
              className={cn(
                'font-serif text-xl',
                prayer.highlight
                  ? 'text-white'
                  : 'text-slate-300 group-hover:text-amber-200',
              )}
            >
              {prayer.time}
            </p>
          </div>
        ))}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Makkah.mp3"
        onEnded={handleAudioEnded}
        className="hidden"
      />
    </motion.div>
  );
};

export default PrayerTimesCard;
