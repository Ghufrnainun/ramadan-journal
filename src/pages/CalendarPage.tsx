import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getDailyStatus, DailyStatusEntry } from '@/lib/daily-status';
import {
  getAllProgress,
  DailyProgress,
  getTrackerItems,
  TrackerItem,
} from '@/lib/tracker-storage';
import { cn } from '@/lib/utils';
import { getProfile } from '@/lib/storage';

const content = {
  id: {
    tracker: 'Tracker',
    completed: 'Selesai',
  },
  en: {
    tracker: 'Tracker',
    completed: 'Completed',
  },
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');

  // Use local content until we have a proper provider
  const t = content[lang];

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyStatuses, setDailyStatuses] = useState<DailyStatusEntry[]>([]);
  const [dailyProgresses, setDailyProgresses] = useState<DailyProgress[]>([]);
  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([]);

  // Load data
  useEffect(() => {
    const profile = getProfile();
    setLang(profile.language);

    // TEMPORARY: Read from localStorage directly for daily status to avoid breaking changes immediately,
    // or I can do a quick replace to export it. Let's do a quick replace in the next step.
    // For this file, I'll assume a `getAllDailyStatuses` exists or similar.
    // Actually, let's just use what we have and maybe refactor later.
    // I will access localStorage directly here as a fallback until I update the lib.

    const storedStatus = localStorage.getItem('myramadhanku_daily_status');
    if (storedStatus) {
      setDailyStatuses(JSON.parse(storedStatus));
    }

    setDailyProgresses(getAllProgress());
    setTrackerItems(getTrackerItems());
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getStatusForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyStatuses.find((s) => s.date === dateStr);
  };

  const getProgressForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyProgresses.find((p) => p.date === dateStr);
  };

  const getDayContent = (date: Date) => {
    const status = getStatusForDate(date);
    const progress = getProgressForDate(date);

    // Logic for indicators
    // Mood: dot color
    // Progress: ring or bar?

    // Mood Colors
    const moodColors: Record<string, string> = {
      happy: 'bg-emerald-500',
      neutral: 'bg-amber-500',
      sad: 'bg-rose-500',
    };

    const moodColor = status?.mood ? moodColors[status.mood] : null;

    // Tracker Completion
    const completedCount = progress
      ? Object.values(progress.items).filter(Boolean).length
      : 0;
    const totalItems = trackerItems.length;
    const progressPercent =
      totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

    return { moodColor, progressPercent, completedCount, totalItems };
  };

  return (
    <ResponsiveLayout className="pb-24">
      {/* Header - Mobile Only? Keep it for now or adapt */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 sticky top-0 bg-[#020617]/80 backdrop-blur z-20">
        <button
          type="button"
          aria-label="Back to dashboard"
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <span className="font-serif text-lg text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div
              key={d}
              className="text-center text-xs text-slate-500 font-medium py-2"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Padding for start of month - simplified for now, can use date-fns properly later if needed to align weekdays */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map(
            (_, i) => (
              <div key={`empty-${i}`} />
            ),
          )}

          {days.map((date, i) => {
            const { moodColor, progressPercent } = getDayContent(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'relative aspect-square rounded-xl flex flex-col items-center justify-center transition-colors border',
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : isTodayDate
                      ? 'bg-slate-800 border-slate-700 text-amber-400'
                      : 'bg-slate-900/50 border-slate-800/50 text-slate-300 hover:bg-slate-800 hover:border-slate-700',
                )}
              >
                <span className="text-sm font-medium relative z-10">
                  {format(date, 'd')}
                </span>

                {/* Indicators */}
                <div className="absolute bottom-2 flex gap-1">
                  {moodColor && (
                    <div
                      className={cn('w-1.5 h-1.5 rounded-full', moodColor)}
                    />
                  )}
                  {progressPercent > 0 && (
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        progressPercent === 100
                          ? 'bg-emerald-400'
                          : 'bg-slate-600',
                      )}
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary for Month */}
      <div className="px-6">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
          <div className="text-center w-1/3">
            <span className="text-2xl font-serif text-white">
              {
                dailyStatuses.filter(
                  (s) =>
                    s.mood === 'happy' &&
                    isSameMonth(new Date(s.date), currentMonth),
                ).length
              }
            </span>
            <p className="text-xs text-slate-500 uppercase mt-1">Happy Days</p>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center w-1/3">
            <span className="text-2xl font-serif text-emerald-400">
              {
                dailyProgresses.filter((p) => {
                  const completed = Object.values(p.items).filter(
                    Boolean,
                  ).length;
                  return (
                    completed === trackerItems.length &&
                    isSameMonth(new Date(p.date), currentMonth)
                  );
                }).length
              }
            </span>
            <p className="text-xs text-slate-500 uppercase mt-1">
              Perfect Days
            </p>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center w-1/3">
            <span className="text-2xl font-serif text-amber-400">
              {
                dailyStatuses.filter(
                  (s) =>
                    s.intention && isSameMonth(new Date(s.date), currentMonth),
                ).length
              }
            </span>
            <p className="text-xs text-slate-500 uppercase mt-1">Journals</p>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl border-b border-slate-800 pb-3">
              {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy')}
            </DialogTitle>
            <DialogDescription className="hidden" />
          </DialogHeader>

          {selectedDate && (
            <div className="space-y-6 pt-2">
              {/* Status Section */}
              {getStatusForDate(selectedDate) ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-400 uppercase">
                    Dialy Journal
                  </h4>
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                    {getStatusForDate(selectedDate)?.mood && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-400 text-sm">Mood:</span>
                        <span className="capitalize text-white font-medium">
                          {getStatusForDate(selectedDate)?.mood}
                        </span>
                      </div>
                    )}
                    <p className="text-slate-300 italic">
                      "
                      {getStatusForDate(selectedDate)?.intention ||
                        'No intention set'}
                      "
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic text-center">
                  No journal entry using for this day.
                </p>
              )}

              {/* Tracker Section */}
              {getProgressForDate(selectedDate) ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-400 uppercase">
                    Tracker
                  </h4>
                  <div className="space-y-2">
                    {trackerItems.map((item) => {
                      const progress = getProgressForDate(selectedDate);
                      const isDone = progress?.items[item.id];
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/20"
                        >
                          <span
                            className={cn(
                              'text-sm',
                              isDone ? 'text-emerald-400' : 'text-slate-500',
                            )}
                          >
                            {item.label[lang]}
                          </span>
                          {isDone ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-slate-700" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic text-center">
                  No tracker data for this day.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveLayout>
  );
};

export default CalendarPage;
