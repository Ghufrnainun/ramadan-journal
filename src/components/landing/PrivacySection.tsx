import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { User, RefreshCw, ShieldCheck } from 'lucide-react';

const privacyIcons = [User, RefreshCw, ShieldCheck];

export function PrivacySection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-navy-deep">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl text-center text-foreground mb-16"
        >
          {t.privacy.title}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {t.privacy.items.map((item, index) => {
            const Icon = privacyIcons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-card/30 border border-border/50 rounded-xl"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-olive/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-olive" />
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
