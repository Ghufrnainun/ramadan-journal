import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { HelpCircle, TrendingDown, Volume2 } from 'lucide-react';

const icons = [HelpCircle, TrendingDown, Volume2];

export function ProblemSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-b from-navy-deep to-navy">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-2xl md:text-3xl text-center text-foreground/80 mb-16"
        >
          {t.problem.title}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {t.problem.items.map((item, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
