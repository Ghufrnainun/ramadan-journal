import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield } from 'lucide-react';

interface WelcomeStepProps {
  lang: 'id' | 'en';
  onNext: () => void;
}

const content = {
  id: {
    greeting: 'Assalamualaikum 👋',
    title: 'Selamat datang di MyRamadhanKu',
    subtitle: 'Teman ibadah Ramadan yang tenang, tanpa tekanan.',
    features: [
      { icon: Sparkles, text: 'Perjalanan ibadah yang personal' },
      { icon: Heart, text: 'Tanpa judgement, tanpa kompetisi' },
      { icon: Shield, text: 'Privasi data sepenuhnya milikmu' },
    ],
    cta: 'Ayo Mulai',
    skip: 'Lewati intro',
  },
  en: {
    greeting: 'Assalamualaikum 👋',
    title: 'Welcome to MyRamadhanKu',
    subtitle: 'Your calm Ramadan companion, no pressure.',
    features: [
      { icon: Sparkles, text: 'Personal worship journey' },
      { icon: Heart, text: 'No judgement, no competition' },
      { icon: Shield, text: 'Your data stays yours' },
    ],
    cta: "Let's Start",
    skip: 'Skip intro',
  },
};

const WelcomeStep: React.FC<WelcomeStepProps> = ({ lang, onNext }) => {
  const t = content[lang];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      {/* Moon Glow Effect */}
      <motion.div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.p
        className="text-amber-400/80 text-sm tracking-widest uppercase mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t.greeting}
      </motion.p>

      <motion.h1
        className="font-serif text-3xl md:text-4xl text-white mb-4 leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {t.title}
      </motion.h1>

      <motion.p
        className="text-slate-400 text-lg max-w-sm mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {t.subtitle}
      </motion.p>

      {/* Features */}
      <motion.div
        className="space-y-4 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {t.features.map((f, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 text-slate-300"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <f.icon className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-sm">{f.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onNext}
        className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold px-10 py-4 rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t.cta}
      </motion.button>
    </div>
  );
};

export default WelcomeStep;
