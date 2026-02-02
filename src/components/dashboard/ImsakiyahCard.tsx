import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Moon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { equranApi, ImsakiyahItem } from '@/lib/api/equran';

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

const ImsakiyahCard: React.FC<ImsakiyahCardProps> = ({ lang, provinsi, kabkota }) => {
  const t = content[lang];
  const [todaySchedule, setTodaySchedule] = useState<ImsakiyahItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImsakiyah = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const now = new Date();
        const tahun = now.getFullYear();
        
        // Fetch Ramadan schedule for the current year
        const schedule = await equranApi.getJadwalImsakiyah(
          provinsi, 
          kabkota, 
          tahun
        );
        
        if (!schedule || schedule.length === 0) {
          setError('noData');
          return;
        }
        
        // Find today's schedule
        const today = now.toISOString().split('T')[0];
        const todayData = schedule.find(item => {
          const itemDate = new Date(item.tanggal).toISOString().split('T')[0];
          return itemDate === today;
        });
        
        if (todayData) {
          setTodaySchedule(todayData);
        } else {
          // If no exact match, we might be outside Ramadan
          setError('notRamadan');
        }
      } catch (error) {
        console.error('Failed to load imsakiyah schedule:', error);
        setError('noData');
      } finally {
        setIsLoading(false);
      }
    };

    loadImsakiyah();
  }, [provinsi, kabkota]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700/30">
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
        <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700/30">
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
      <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700/30">
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
              {new Date(todaySchedule.tanggal).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ImsakiyahCard;
