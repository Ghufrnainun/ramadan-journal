import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Clock, CheckSquare, Hand, BookOpen, PenLine, Quote } from 'lucide-react';

const featureIcons = [Clock, CheckSquare, Hand, BookOpen, PenLine, Quote];

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-navy-deep to-navy">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl text-center text-foreground mb-16"
        >
          {t.features.title}
        </motion.h2>

        <div className="max-w-4xl mx-auto space-y-8">
          {t.features.items.map((feature, index) => {
            const Icon = featureIcons[index];
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col md:flex-row items-center gap-6 ${isEven ? '' : 'md:flex-row-reverse'}`}
              >
                {/* Feature content */}
                <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'} text-center`}>
                  <h3 className="font-medium text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Icon */}
                <div className="order-first md:order-none w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Mini UI mockup */}
                <div className="flex-1 hidden lg:block">
                  <div className="w-full max-w-[180px] h-24 bg-card/50 border border-border/50 rounded-lg mx-auto" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
