import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Sun, Clock, Sunset, Moon } from 'lucide-react';

const timeIcons = {
  pagi: Sun,
  siang: Clock,
  maghrib: Sunset,
  malam: Moon,
};

const timeColors = {
  pagi: 'from-amber-500/20 to-orange-500/10',
  siang: 'from-yellow-500/20 to-amber-500/10',
  maghrib: 'from-orange-500/20 to-red-500/10',
  malam: 'from-indigo-500/20 to-purple-500/10',
};

export function DailyFlowSection() {
  const { t } = useLanguage();

  const times = [
    { key: 'pagi' as const, ...t.dailyFlow.times.pagi },
    { key: 'siang' as const, ...t.dailyFlow.times.siang },
    { key: 'maghrib' as const, ...t.dailyFlow.times.maghrib },
    { key: 'malam' as const, ...t.dailyFlow.times.malam },
  ];

  return (
    <section className="py-20 bg-navy-deep">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl text-center text-foreground mb-16"
        >
          {t.dailyFlow.title}
        </motion.h2>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {times.map((time, index) => {
              const Icon = timeIcons[time.key];
              return (
                <motion.div
                  key={time.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative text-center"
                >
                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${timeColors[time.key]} flex items-center justify-center border border-border/50`}>
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <h3 className="font-medium text-foreground mb-0.5">{time.title}</h3>
                  <p className="text-xs text-primary mb-2">{time.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {time.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
