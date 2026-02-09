import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Sunrise, Sunset, Clock, Moon, Info, AlertCircle, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface RemindersStepProps {
  lang: 'id' | 'en';
  initialReminders?: {
    sahur: boolean;
    iftar: boolean;
    prayer: boolean;
    reflection: boolean;
  };
  onComplete: (reminders: {
    sahur: boolean;
    iftar: boolean;
    prayer: boolean;
    reflection: boolean;
  }) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

interface ReminderOption {
  id: 'sahur' | 'iftar' | 'prayer' | 'reflection';
  icon: LucideIcon;
  label: { id: string; en: string };
  desc: { id: string; en: string };
}

const REMINDERS: ReminderOption[] = [
  {
    id: 'sahur',
    icon: Sunrise,
    label: { id: 'Sahur', en: 'Suhoor' },
    desc: { id: '30 menit sebelum imsak', en: '30 minutes before Imsak' },
  },
  {
    id: 'iftar',
    icon: Sunset,
    label: { id: 'Berbuka', en: 'Iftar' },
    desc: { id: 'Saat waktu Maghrib', en: 'At Maghrib time' },
  },
  {
    id: 'prayer',
    icon: Clock,
    label: { id: 'Waktu Sholat', en: 'Prayer Times' },
    desc: { id: 'Notifikasi 5 waktu', en: '5 daily prayers notification' },
  },
  {
    id: 'reflection',
    icon: Moon,
    label: { id: 'Refleksi Malam', en: 'Night Reflection' },
    desc: { id: 'Pengingat jurnal setelah Isya', en: 'Journal reminder after Isha' },
  },
];

const content = {
  id: {
    title: 'Pengingat',
    subtitle: 'Semua OFF secara default. Nyalakan yang kamu butuhkan.',
    philosophy: 'Kami menghormati ketenanganmu. Notifikasi hanya berfungsi saat app terbuka.',
    iosWarning: 'Browser iOS membatasi notifikasi. Kami tidak bisa menjamin 100%.',
    done: 'Selesai',
    back: 'Kembali',
    allOff: 'Semua mati',
  },
  en: {
    title: 'Reminders',
    subtitle: 'All OFF by default. Turn on what you need.',
    philosophy: 'We respect your peace. Notifications only work when app is open.',
    iosWarning: 'iOS browsers limit notifications. We cannot guarantee 100%.',
    done: 'Done',
    back: 'Back',
    allOff: 'All off',
  },
};

const RemindersStep: React.FC<RemindersStepProps> = ({
  lang,
  initialReminders,
  onComplete,
  onBack,
  isSubmitting = false,
}) => {
  const t = content[lang];
  const [reminders, setReminders] = useState(
    initialReminders || {
      sahur: false,
      iftar: false,
      prayer: false,
      reflection: false,
    }
  );

  const toggleReminder = (id: 'sahur' | 'iftar' | 'prayer' | 'reflection') => {
    setReminders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allOff = !Object.values(reminders).some(Boolean);

  const handleComplete = () => {
    onComplete(reminders);
  };

  return (
    <div className="pt-8">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          {allOff ? (
            <BellOff className="w-8 h-8 text-slate-400" />
          ) : (
            <Bell className="w-8 h-8 text-amber-400" />
          )}
        </div>
        <h2 className="font-serif text-2xl text-white mb-2">{t.title}</h2>
        <p className="text-slate-400">{t.subtitle}</p>
      </motion.div>

      {/* Philosophy Note */}
      <motion.div
        className="mb-6 p-4 bg-slate-800/30 border border-slate-700 rounded-xl flex items-start gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-slate-400 text-sm">{t.philosophy}</p>
      </motion.div>

      {/* Reminder Options */}
      <motion.div
        className="space-y-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {REMINDERS.map((reminder, i) => {
          const isOn = reminders[reminder.id];
          const Icon = reminder.icon;

          return (
            <motion.button
              key={reminder.id}
              onClick={() => toggleReminder(reminder.id)}
              className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                isOn
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isOn ? 'bg-amber-500/20' : 'bg-slate-700/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isOn ? 'text-amber-400' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isOn ? 'text-white' : 'text-slate-300'}`}>
                  {reminder.label[lang]}
                </p>
                <p className="text-xs text-slate-500">{reminder.desc[lang]}</p>
              </div>
              {/* Toggle Switch */}
              <div
                className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                  isOn ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    isOn ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* iOS Warning */}
      <motion.div
        className="flex items-start gap-2 text-slate-500 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>{t.iosWarning}</p>
      </motion.div>

      {/* All Off Message */}
      {allOff && (
        <motion.p
          className="text-center text-slate-500 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ {t.allOff}
        </motion.p>
      )}

      {/* Navigation */}
      <div className="sticky bottom-0 z-20 -mx-6 mt-8 border-t border-slate-800/70 bg-[#020617]/95 px-6 py-6 pb-safe backdrop-blur">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800/50 transition-colors"
          >
            {t.back}
          </button>
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-xl font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{lang === 'id' ? 'Menyimpan...' : 'Saving...'}</span>
              </>
            ) : (
              t.done
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemindersStep;
