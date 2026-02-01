import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Flame } from 'lucide-react';

export function StreakSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-navy">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
            {t.streak.title}
          </h2>
          <p className="text-primary mb-6">{t.streak.subtitle}</p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t.streak.description}
          </p>
          
          {/* Visual streak example */}
          <div className="inline-flex items-center gap-1.5 p-4 bg-card/50 border border-border rounded-xl">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${i < 5 ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground italic">
            {t.streak.note}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
