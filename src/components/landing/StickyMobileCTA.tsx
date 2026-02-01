import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';

export function StickyMobileCTA() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 420);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-navy-deep/95 backdrop-blur-md border-t border-border/50 sm:hidden"
        >
          <div className="flex flex-col items-center gap-2">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg glow-gold-sm"
              onClick={() => window.location.href = '/onboarding'}
            >
              {t.hero.cta}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t.hero.ctaSubtext}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
