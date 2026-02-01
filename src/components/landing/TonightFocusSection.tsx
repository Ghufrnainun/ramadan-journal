import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';

export function TonightFocusSection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 bg-navy-deep">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="font-serif text-3xl md:text-4xl text-foreground/90 leading-relaxed">
            <span className="text-primary italic">{t.tonightFocus.line1}</span>
            <br />
            {t.tonightFocus.line2}
          </p>
          <p className="mt-6 text-muted-foreground text-lg">
            {t.tonightFocus.description}
          </p>
        </motion.div>
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
