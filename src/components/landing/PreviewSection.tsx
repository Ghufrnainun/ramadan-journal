import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Calendar, Quote, CheckSquare, Hand } from 'lucide-react';

const cardIcons = {
  countdown: Calendar,
  quote: Quote,
  checklist: CheckSquare,
  dhikr: Hand,
};

export function PreviewSection() {
  const { t } = useLanguage();

  const cards = [
    { key: 'countdown' as const, ...t.preview.cards.countdown },
    { key: 'quote' as const, ...t.preview.cards.quote },
    { key: 'checklist' as const, ...t.preview.cards.checklist },
    { key: 'dhikr' as const, ...t.preview.cards.dhikr },
  ];

  return (
    <section id="preview" className="py-20 bg-gradient-to-b from-navy to-navy-deep">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl text-center text-foreground mb-16"
        >
          {t.preview.title}
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {cards.map((card, index) => {
            const Icon = cardIcons[card.key];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-card border border-border rounded-xl p-6 h-full transition-all duration-300 group-hover:border-primary/30 group-hover:bg-card/80">
                  {/* Mock UI preview */}
                  <div className="aspect-square bg-secondary/30 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <Icon className="w-10 h-10 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
