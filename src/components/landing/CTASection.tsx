import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import { StarField } from './StarField';

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 bg-navy overflow-hidden">
      {/* Star background */}
      <StarField count={30} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8">
            {t.cta.title}
          </h2>
          
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg glow-gold"
            onClick={() => window.location.href = '/onboarding'}
          >
            {t.cta.button}
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            {t.cta.subtext}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
