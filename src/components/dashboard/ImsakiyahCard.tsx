import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Moon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { equranApi, ImsakiyahItem } from '@/lib/api/equran';
import { getCityMapping, resolveCityMapping } from '@/lib/prayer-times';
import { getLocalDateKey } from '@/lib/date';

interface ImsakiyahCardProps {
  lang: 'id' | 'en';
  provinsi: string;
  kabkota: string;
}

const content = {
  id: {
    title: 'Jadwal Imsakiyah',
    subtitle: 'Hari ini',
    imsak: 'Imsak',
    iftar: 'Berbuka',
    loading: 'Memuat...',
    noData: 'Data tidak tersedia',
    notRamadan: 'Di luar bulan Ramadan',
  },
  en: {
    title: 'Imsakiyah Schedule',
    subtitle: 'Today',
    imsak: 'Imsak',
    iftar: 'Iftar',
    loading: 'Loading...',
    noData: 'Data not available',
    notRamadan: 'Outside Ramadan',
  },
};

const ImsakiyahCard: React.FC<ImsakiyahCardProps> = ({
  lang,
  provinsi,
  kabkota,
}) => {
  const t = content[lang];
  const [todaySchedule, setTodaySchedule] = useState<ImsakiyahItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
      return await new Promise<T>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          reject(new Error('Request timed out'));
        }, ms);

        promise
          .then((value) => {
            window.clearTimeout(timeoutId);
            resolve(value);
          })
          .catch((err) => {
            window.clearTimeout(timeoutId);
            reject(err);
          });
      });
    };

    const loadImsakiyah = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      try {
        const now = new Date();
        const tahun = now.getFullYear();

        // Resolve mapping with timeout to avoid indefinite loading on network stalls
        const fallbackMapping = getCityMapping(kabkota, provinsi);
        const mapping = await withTimeout(
          resolveCityMapping(kabkota, provinsi).catch(() => fallbackMapping),
          8000,
        );

        // Fetch Ramadan schedule for the current year with timeout
        const schedule = await withTimeout(
          equranApi.getJadwalImsakiyah(mapping.provinsi, mapping.kabkota, tahun),
          10000,
        );
        if (!isMounted) return;

        if (!schedule || schedule.length === 0) {
          setError('noData');
          return;
        }

        // Find today's schedule
        const today = getLocalDateKey(now);
        const todayData = schedule.find((item) => item.tanggal === today);

        if (todayData) {
          setTodaySchedule(todayData);
        } else {
          // If no exact match, we might be outside Ramadan
          setError('notRamadan');
        }
      } catch (error) {
        console.error('Failed to load imsakiyah schedule:', error);
        if (!isMounted) return;
        setError('noData');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    void loadImsakiyah();
    // Note: 'lang' is intentionally not in deps as it only affects display text, not data fetching
    // Year is calculated at fetch time, so location change triggers new fetch with current year
    return () => {
      isMounted = false;
    };
  }, [provinsi, kabkota]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              {t.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || !todaySchedule) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              {t.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-4 text-slate-400 text-sm">
              {error === 'notRamadan' ? t.notRamadan : t.noData}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-slate-900/60 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              {t.title}
            </CardTitle>
            <span className="text-xs text-purple-300">{t.subtitle}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            {/* Imsak Time */}
            <div className="rounded-xl p-4 bg-purple-800/30 border border-purple-600/30 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sunrise className="w-4 h-4 text-purple-300" />
                <p className="text-xs text-purple-300 font-medium">{t.imsak}</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {todaySchedule.imsak}
              </p>
            </div>

            {/* Iftar Time (Maghrib) */}
            <div className="rounded-xl p-4 bg-amber-800/30 border border-amber-600/30 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-amber-300" />
                <p className="text-xs text-amber-300 font-medium">{t.iftar}</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {todaySchedule.maghrib}
              </p>
            </div>
          </div>

          {/* Date display */}
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-400">
              {new Date(todaySchedule.tanggal).toLocaleDateString(
                lang === 'id' ? 'id-ID' : 'en-US',
                {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ImsakiyahCard;
