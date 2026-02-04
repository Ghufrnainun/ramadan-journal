import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Clock, BookOpen, Heart, CheckSquare, PenLine, Check } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FocusStepProps {
  lang: 'id' | 'en';
  initialModules?: string[];
  onNext: (modules: string[]) => void;
  onBack: () => void;
}

interface Module {
  id: string;
  icon: LucideIcon;
  label: { id: string; en: string };
  desc: { id: string; en: string };
}

const MODULES: Module[] = [
  {
    id: 'prayer',
    icon: Clock,
    label: { id: 'Waktu Sholat', en: 'Prayer Times' },
    desc: { id: 'Jadwal sholat otomatis', en: 'Automatic prayer schedule' },
  },
  {
    id: 'quran',
    icon: BookOpen,
    label: { id: 'Tadarus Quran', en: 'Quran Reading' },
    desc: { id: 'Progress bacaan harian', en: 'Daily reading progress' },
  },
  {
    id: 'dhikr',
    icon: Heart,
    label: { id: 'Dzikir Counter', en: 'Dhikr Counter' },
    desc: { id: 'Hitung dzikir dengan tap', en: 'Count dhikr with tap' },
  },
  {
    id: 'tracker',
    icon: CheckSquare,
    label: { id: 'Daily Tracker', en: 'Daily Tracker' },
    desc: { id: 'Checklist ibadah harian', en: 'Daily worship checklist' },
  },
  {
    id: 'reflection',
    icon: PenLine,
    label: { id: 'Refleksi Malam', en: 'Night Reflection' },
    desc: { id: 'Jurnal syukur harian', en: 'Daily gratitude journal' },
  },
];

const content = {
  id: {
    title: 'Fokus Ibadahmu',
    subtitle: 'Pilih fitur yang ingin muncul di dashboard.',
    hint: 'Bisa diubah kapan saja.',
    next: 'Lanjut',
    back: 'Kembali',
  },
  en: {
    title: 'Your Focus',
    subtitle: 'Choose which features appear on your dashboard.',
    hint: 'Can be changed anytime.',
    next: 'Continue',
    back: 'Back',
  },
};

const FocusStep: React.FC<FocusStepProps> = ({ lang, initialModules, onNext, onBack }) => {
  const t = content[lang];
  const [selected, setSelected] = useState<string[]>(
    initialModules || MODULES.map(m => m.id)
  );

  const toggleModule = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    onNext(selected.length > 0 ? selected : MODULES.map(m => m.id));
  };

  return (
    <div className="pt-8">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="font-serif text-2xl text-white mb-2">{t.title}</h2>
        <p className="text-slate-400">{t.subtitle}</p>
      </motion.div>

      {/* Module Grid */}
      <motion.div
        className="space-y-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {MODULES.map((module, i) => {
          const isSelected = selected.includes(module.id);
          const Icon = module.icon;

          return (
            <motion.button
              key={module.id}
              onClick={() => toggleModule(module.id)}
              className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-amber-500/20' : 'bg-slate-700/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}
                />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {module.label[lang]}
                </p>
                <p className="text-xs text-slate-500">{module.desc[lang]}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400'
                    : 'border-slate-600'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-slate-900" />}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.p
        className="text-center text-slate-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {t.hint}
      </motion.p>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-safe bg-[#020617]/90">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800/50 transition-colors"
          >
            {t.back}
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-4 rounded-xl font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusStep;
