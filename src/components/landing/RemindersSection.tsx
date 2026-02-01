import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { BellOff, VolumeX } from 'lucide-react';

export function RemindersSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-b from-navy to-navy-deep">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
              <BellOff className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
              <VolumeX className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
            {t.reminders.title}
          </h2>
          <p className="text-primary mb-6">{t.reminders.subtitle}</p>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {t.reminders.description}
          </p>
          
          {/* Limitations note */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/30 border border-border/50 rounded-lg text-sm text-muted-foreground">
            <span className="text-xs">ℹ️</span>
            <span>{t.reminders.limitations}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
