import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Info } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
    pickDate: 'Pilih tanggal...',
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
    pickDate: 'Pick a date...',
    next: 'Continue',
    back: 'Back',
  },
};

const CalendarStep: React.FC<CalendarStepProps> = ({ lang, initialDate, onNext, onBack }) => {
  const t = content[lang];
  const defaultDateObj = new Date(t.defaultDate);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : defaultDateObj
  );
  const [useDefault, setUseDefault] = useState(!initialDate || initialDate === t.defaultDate);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const locale = lang === 'id' ? idLocale : enUS;

  const formatDateDisplay = (date: Date) => {
    return format(date, "EEEE, d MMMM yyyy", { locale });
  };

  const handleContinue = () => {
    const dateToSave = useDefault ? defaultDateObj : selectedDate;
    if (dateToSave) {
      onNext(format(dateToSave, 'yyyy-MM-dd'));
    }
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
          setSelectedDate(defaultDateObj);
        }}
        className={`w-full p-5 rounded-xl border text-left mb-4 transition-all ${
          useDefault
            ? 'bg-amber-500/10 border-amber-500/50'
            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
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
            <p className="text-white font-medium">{formatDateDisplay(defaultDateObj)}</p>
          </div>
        </div>
      </motion.button>

      {/* Manual Date Picker with Shadcn Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-slate-500 text-sm mb-3">{t.manualLabel}</p>
        
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={() => setUseDefault(false)}
              className={`w-full p-5 rounded-xl border text-left transition-all ${
                !useDefault
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
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
                <div className="flex-1 flex items-center gap-3">
                  <CalendarDays className={`w-5 h-5 ${!useDefault ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className={!useDefault && selectedDate ? 'text-white' : 'text-slate-400'}>
                    {!useDefault && selectedDate 
                      ? formatDateDisplay(selectedDate)
                      : t.pickDate
                    }
                  </span>
                </div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-slate-800 border-slate-700 z-50" 
            align="center"
            sideOffset={8}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setUseDefault(false);
                  setCalendarOpen(false);
                }
              }}
              defaultMonth={selectedDate || defaultDateObj}
              initialFocus
              className={cn("p-3 pointer-events-auto bg-slate-800 text-white rounded-lg")}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-white",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-slate-700 rounded",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal text-slate-200 hover:bg-slate-700 rounded-md transition-colors",
                day_range_end: "day-range-end",
                day_selected: "bg-amber-500 text-slate-900 hover:bg-amber-500 hover:text-slate-900 focus:bg-amber-500 focus:text-slate-900 font-semibold",
                day_today: "bg-slate-700 text-amber-400",
                day_outside: "text-slate-600 opacity-50",
                day_disabled: "text-slate-600 opacity-50",
                day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-white",
                day_hidden: "invisible",
              }}
            />
          </PopoverContent>
        </Popover>
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
