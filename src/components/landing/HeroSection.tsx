import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import { LanternRow } from './Lantern';
import { StarField } from './StarField';
import { CountdownChip } from './CountdownChip';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  const { t } = useLanguage();

  // Ramadan 2025 start date (approximately March 1, 2025)
  const ramadanStart = new Date('2025-03-01T00:00:00');

  const scrollToPreview = () => {
    const element = document.getElementById('preview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-navy-deep via-navy to-charcoal animate-gradient-drift"
      />
      
      {/* Star field */}
      <StarField count={60} />
      
      {/* Lanterns */}
      <LanternRow />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-16">
        {/* Countdown chip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <CountdownChip 
            targetDate={ramadanStart} 
            label={t.hero.countdown}
            suffix={t.hero.days}
          />
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold mb-4"
        >
          <span className="text-foreground">{t.hero.title}</span>
          <br />
          <span className="text-primary">{t.hero.subtitle}</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
        >
          {t.hero.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg glow-gold-sm"
            onClick={() => window.location.href = '/onboarding'}
          >
            {t.hero.cta}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="text-muted-foreground hover:text-foreground"
            onClick={scrollToPreview}
          >
            {t.nav.seePreview}
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground/50"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
