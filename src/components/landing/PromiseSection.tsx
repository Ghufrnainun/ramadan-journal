import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Heart } from 'lucide-react';

export function PromiseSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-navy relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Heart className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            {t.promise.title}
          </h2>
          <p className="text-lg text-primary mb-6">{t.promise.subtitle}</p>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {t.promise.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
