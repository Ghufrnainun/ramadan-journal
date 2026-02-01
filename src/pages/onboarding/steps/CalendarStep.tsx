import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Info } from 'lucide-react';

interface CalendarStepProps {
  lang: 'id' | 'en';
  initialDate?: string | null;
  onNext: (date: string) => void;
  onBack: () => void;
}

const content = {
  id: {
    title: 'Tanggal 1 Ramadan',
    subtitle: 'Sesuaikan dengan hasil Sidang Isbat nanti.',
    note: 'Bisa diubah kapan saja di pengaturan.',
    defaultLabel: 'Perkiraan 2025',
    defaultDate: '2025-02-28',
    manualLabel: 'Atau pilih manual:',
    next: 'Lanjut',
    back: 'Kembali',
  },
  en: {
    title: 'Ramadan Start Date',
    subtitle: 'Adjust based on official moon sighting.',
    note: 'Can be changed anytime in settings.',
    defaultLabel: 'Estimated 2025',
    defaultDate: '2025-02-28',
    manualLabel: 'Or select manually:',
    next: 'Continue',
    back: 'Back',
  },
};

const CalendarStep: React.FC<CalendarStepProps> = ({ lang, initialDate, onNext, onBack }) => {
  const t = content[lang];
  const [selectedDate, setSelectedDate] = useState(initialDate || t.defaultDate);
  const [useDefault, setUseDefault] = useState(!initialDate || initialDate === t.defaultDate);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleContinue = () => {
    onNext(useDefault ? t.defaultDate : selectedDate);
  };

  return (
    <div className="pt-8">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="font-serif text-2xl text-white mb-2">{t.title}</h2>
        <p className="text-slate-400">{t.subtitle}</p>
      </motion.div>

      {/* Default Option */}
      <motion.button
        onClick={() => {
          setUseDefault(true);
          setSelectedDate(t.defaultDate);
        }}
        className={`w-full p-5 rounded-xl border text-left mb-4 transition-all ${
          useDefault
            ? 'bg-amber-500/10 border-amber-500/50'
            : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
              useDefault ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
            }`}
          >
            {useDefault && <div className="w-2 h-2 rounded-full bg-slate-900" />}
          </div>
          <div>
            <p className="text-xs text-amber-400/70 mb-1">{t.defaultLabel}</p>
            <p className="text-white font-medium">{formatDate(t.defaultDate)}</p>
          </div>
        </div>
      </motion.button>

      {/* Manual Date Picker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-slate-500 text-sm mb-3">{t.manualLabel}</p>
        <button
          onClick={() => setUseDefault(false)}
          className={`w-full p-5 rounded-xl border text-left transition-all ${
            !useDefault
              ? 'bg-amber-500/10 border-amber-500/50'
              : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                !useDefault ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
              }`}
            >
              {!useDefault && <div className="w-2 h-2 rounded-full bg-slate-900" />}
            </div>
            <div className="flex-1">
              <input
                type="date"
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setUseDefault(false);
                }}
                onClick={() => setUseDefault(false)}
                className="w-full bg-transparent text-white focus:outline-none"
              />
            </div>
          </div>
        </button>
      </motion.div>

      {/* Info Note */}
      <motion.div
        className="mt-6 flex items-start gap-3 text-slate-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>{t.note}</p>
      </motion.div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800/50 transition-all"
          >
            {t.back}
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 transition-all"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarStep;
