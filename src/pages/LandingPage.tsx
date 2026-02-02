import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import {
  Moon,
  ChevronDown,
  Shield,
  Heart,
  Share2,
  BookOpen,
  Clock,
  Smartphone,
  VolumeX,
  Leaf,
} from 'lucide-react';
import { getRamadanInfo } from '@/lib/ramadan-dates';

/**
 * =====================================================================
 * DATA & TRANSLATIONS
 * =====================================================================
 */
type Lang = 'id' | 'en';

const CONTENT = {
  id: {
    hero: {
      label: 'Teman Ibadah Digital',
      headline: 'Ramadan, Tenang.',
      subhead:
        'Jurnal Ramadan yang fokus pada ketenangan hati, bukan sekadar mengejar target angka.',
      cta_primary: 'Mulai Sekarang',
      cta_secondary: 'Lihat Preview',
      trust: ['Privasi Aman'],
      countdown: 'Ramadan dimulai dalam ±32 hari',
    },
    whisper: {
      text: 'Malam ini, pelan-pelan saja. Bernapas. Kita mulai lagi esok hari.',
      note: 'Berdasarkan penetapan Sidang Isbat nanti.',
    },
    problem: {
      title: 'Kenapa MyRamadhan?',
      points: [
        { t: 'Bingung', d: 'Terlalu banyak fitur, hilang fokus ibadah.' },
        { t: 'Berat', d: 'Aplikasi lain penuh iklan & notifikasi bising.' },
        { t: 'Kompetitif', d: 'Ibadah jadi beban karena leaderboard.' },
      ],
    },
    promise: {
      title: 'Janji Kami',
      text: 'Sebuah ruang digital yang tenang, ringan, dan menemani tanpa menghakimi.',
      badge: 'No Judgement Zone',
    },
    day_flow: {
      title: 'Satu Hari Bersama Kami',
      steps: [
        {
          time: 'Pagi',
          title: 'Niat & Fokus',
          desc: 'Satu kutipan penyemangat saat sahur.',
        },
        {
          time: 'Siang',
          title: 'Tracker Ringan',
          desc: 'Checklist simpel di sela kesibukan.',
        },
        {
          time: 'Sore',
          title: 'Jelang Berbuka',
          desc: 'Hitung mundur & doa harian.',
        },
        {
          time: 'Malam',
          title: 'Refleksi',
          desc: 'Jurnal syukur sebelum tidur.',
        },
      ],
    },
    features: {
      1: {
        title: 'Waktu Sholat & Imsak',
        desc: 'Otomatis sesuai lokasi, tanpa suara bising default.',
      },
      2: {
        title: 'Dzikir Counter',
        desc: 'Tap area luas, getaran lembut, reset harian otomatis.',
      },
      3: {
        title: 'Target Tadarus',
        desc: 'Progress bar visual yang tidak mengintimidasi.',
      },
      4: {
        title: 'Koleksi Doa',
        desc: 'Bookmark doa-doa favorit untuk dibaca cepat.',
      },
      5: {
        title: 'Mode Offline',
        desc: 'Tetap lancar saat sinyal susah atau mode pesawat.',
      },
      6: {
        title: 'Kartu Refleksi',
        desc: 'Bagikan momen bermakna dengan desain estetik.',
      },
    },
    streak: {
      title: 'Hari Aktif Ramadan',
      desc: 'Bukan tentang rantai yang putus, tapi tentang kembali hadir.',
      label: '30 Hari Perjalanan',
    },
    reminders: {
      title: 'Notifikasi yang Sopan',
      desc: 'Kami menghormati ketenanganmu. Notifikasi default adalah OFF. Nyalakan hanya yang penting.',
      limit: '*Browser mungkin membatasi notifikasi di iOS',
    },
    privacy: {
      title: 'Privasi Adalah Prioritas',
      bullets: [
        'Mode Tamu (Tanpa Login)',
        'Sinkronisasi Opsional',
        'Tidak Ada Pelacakan Iklan',
      ],
      cta: 'Baca Manifesto Data',
    },
    faq: {
      title: 'Pertanyaan Umum',
      items: [
        {
          q: 'Apakah aplikasi ini gratis?',
          a: '100% Gratis dan open source. Tanpa fitur berbayar.',
        },
        {
          q: 'Perlu login?',
          a: 'Tidak. Anda bisa menggunakan Mode Tamu selamanya.',
        },
        {
          q: 'Bisa dipakai offline?',
          a: 'Ya, ini adalah PWA. Bisa diinstal dan jalan tanpa internet.',
        },
        {
          q: 'Tanggal Ramadan bisa diubah?',
          a: 'Ya, Anda bisa menyesuaikan tanggal 1 Ramadan manual.',
        },
        {
          q: 'Apakah data saya aman?',
          a: 'Data tersimpan di HP Anda (local storage) kecuali Anda login.',
        },
      ],
    },
    final: {
      title: 'Siap Menyambut Ramadan?',
      sub: 'Mari jalani dengan lebih sadar dan tenang.',
      cta: 'Mulai Perjalanan',
      micro: 'Ringan untuk semua HP',
    },
    sticky: {
      text: 'Mulai dalam 30 detik',
      cta: 'Buka App',
    },
    testimonials: [
      {
        t: 'Akhirnya ada app yang nggak bikin merasa bersalah kalau lupa isi.',
        u: 'Rina, Jakarta',
      },
      {
        t: 'Tampilannya adem banget di mata pas bangun sahur.',
        u: 'Dimas, Bandung',
      },
      {
        t: 'Simpel, to the point, gak berat di HP kentang.',
        u: 'Fauzan, Jogja',
      },
    ],
  },
  en: {
    hero: {
      label: 'Digital Worship Companion',
      headline: 'Ramadan, Calm.',
      subhead:
        'A Ramadan journal focused on peace of heart, not just chasing numbers.',
      cta_primary: 'Get Started',
      cta_secondary: 'See Preview',
      trust: ['Offline PWA', 'No Ads', 'Private'],
      countdown: 'Ramadan starts in ±32 days',
    },
    whisper: {
      text: 'Tonight, take it slow. Just breathe. We start again tomorrow.',
      note: 'Subject to official sighting (Sidang Isbat).',
    },
    problem: {
      title: 'Why MyRamadhan?',
      points: [
        { t: 'Confusing', d: 'Too many features, losing spiritual focus.' },
        { t: 'Heavy', d: 'Other apps are full of ads & loud notifications.' },
        {
          t: 'Competitive',
          d: 'Worship feels like a burden due to leaderboards.',
        },
      ],
    },
    promise: {
      title: 'Our Promise',
      text: 'A digital space that is calm, lightweight, and accompanies without judging.',
      badge: 'No Judgement Zone',
    },
    day_flow: {
      title: 'A Day With Us',
      steps: [
        {
          time: 'Morning',
          title: 'Intention',
          desc: 'One uplifting quote at Suhoor.',
        },
        {
          time: 'Noon',
          title: 'Light Tracker',
          desc: 'Simple checklist between tasks.',
        },
        {
          time: 'Evening',
          title: 'Pre-Maghrib',
          desc: 'Countdown & daily prayers.',
        },
        {
          time: 'Night',
          title: 'Reflection',
          desc: 'Gratitude journal before sleep.',
        },
      ],
    },
    features: {
      1: {
        title: 'Prayer & Imsak',
        desc: 'Auto-location, no loud default sounds.',
      },
      2: {
        title: 'Dhikr Counter',
        desc: 'Large tap area, haptic feedback, auto-daily reset.',
      },
      3: {
        title: 'Quran Goals',
        desc: "Visual progress bar that doesn't intimidate.",
      },
      4: {
        title: 'Prayer Collection',
        desc: 'Bookmark favorite Duas for quick access.',
      },
      5: {
        title: 'Offline Mode',
        desc: 'Smooth even with bad signal or airplane mode.',
      },
      6: {
        title: 'Reflection Cards',
        desc: 'Share meaningful moments with aesthetic design.',
      },
    },
    streak: {
      title: 'Active Ramadan Days',
      desc: "It's not about the broken chain, it's about showing up again.",
      label: '30 Days Journey',
    },
    reminders: {
      title: 'Respectful Notifications',
      desc: 'We respect your peace. Default is OFF. Turn on only what matters.',
      limit: '*Browsers might limit notifications on iOS',
    },
    privacy: {
      title: 'Privacy First',
      bullets: ['Guest Mode (No Login)', 'Optional Sync', 'No Ad Tracking'],
      cta: 'Read Data Manifesto',
    },
    faq: {
      title: 'Common Questions',
      items: [
        { q: 'Is it free?', a: '100% Free and open source. No paid features.' },
        { q: 'Login required?', a: 'No. You can use Guest Mode forever.' },
        {
          q: 'Works offline?',
          a: "Yes, it's a PWA. Installs and runs without internet.",
        },
        {
          q: 'Change Ramadan date?',
          a: 'Yes, you can manually adjust the start date.',
        },
        {
          q: 'Is my data safe?',
          a: 'Data is stored on your phone (local storage) unless you login.',
        },
      ],
    },
    final: {
      title: 'Ready for Ramadan?',
      sub: "Let's go through it with more mindfulness.",
      cta: 'Start Journey',
      micro: 'Lightweight for all phones',
    },
    sticky: {
      text: 'Start in 30 seconds',
      cta: 'Open App',
    },
    testimonials: [
      {
        t: "Finally an app that doesn't make me feel guilty.",
        u: 'Rina, Jakarta',
      },
      {
        t: 'The interface is so soothing for my eyes at Suhoor.',
        u: 'Dimas, Bandung',
      },
      { t: 'Simple, to the point, works on my old phone.', u: 'Fauzan, Jogja' },
    ],
  },
};

/**
 * =====================================================================
 * SUB-COMPONENTS
 * =====================================================================
 */

const NoiseOverlay = () => (
  <div
    className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

const StarField = () => {
  const [stars, setStars] = useState<
    {
      top: string;
      left: string;
      size: string;
      duration: string;
      delay: string;
    }[]
  >([]);

  useEffect(() => {
    const generatedStars = [...Array(24)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 2}s`,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: parseFloat(s.duration),
            repeat: Infinity,
            delay: parseFloat(s.delay),
          }}
        />
      ))}
    </div>
  );
};

const Lantern = ({ delay = 0, x = '10%', scale = 1, duration = 6 }) => {
  return (
    <motion.div
      className="absolute top-0 z-10"
      style={{ left: x, scale }}
      animate={{ rotate: [-3, 3, -3] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* String */}
      <div className="w-px h-16 bg-gradient-to-b from-amber-900/50 to-amber-700/80 mx-auto" />

      {/* Lantern Body */}
      <motion.div
        className="relative"
        animate={{ y: [0, 5, 0] }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
      >
        <svg
          width="48"
          height="72"
          viewBox="0 0 48 72"
          fill="none"
          className="drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]"
        >
          <path d="M12 8 H36 L38 16 H10 Z" fill="#92400e" />
          <path
            d="M10 16 C8 24 6 40 6 48 C6 60 12 68 24 68 C36 68 42 60 42 48 C42 40 40 24 38 16 Z"
            fill="url(#lanternGradient)"
            fillOpacity="0.6"
            stroke="#d97706"
            strokeWidth="1.5"
          />
          <ellipse
            cx="24"
            cy="40"
            rx="10"
            ry="16"
            fill="#fbbf24"
            fillOpacity="0.4"
          />
          <path d="M20 68 L24 76 L28 68" fill="#92400e" />
          <defs>
            <linearGradient
              id="lanternGradient"
              x1="24"
              y1="16"
              x2="24"
              y2="68"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </motion.div>
  );
};

const MoonTimeline = () => (
  <div className="flex items-center justify-center gap-3 py-8">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-200 to-amber-400"
        style={{ opacity: 0.3 + i * 0.1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

const MockupCard = ({ type }: { type: 'count' | 'quote' | 'dhikr' }) => {
  return (
    <div className="w-64 h-80 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex-shrink-0 shadow-2xl">
      {type === 'count' && (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clock className="w-10 h-10 text-amber-400" />
          </motion.div>
          <p className="text-4xl font-bold text-white font-serif">04:32</p>
          <p className="text-sm text-slate-400 mt-2">Menjelang Maghrib</p>
        </div>
      )}
      {type === 'quote' && (
        <div className="h-full flex flex-col items-center justify-center text-center px-2">
          <p className="text-4xl text-amber-400 font-serif mb-4">"</p>
          <p className="text-white/90 font-serif italic text-lg leading-relaxed">
            Maka sesungguhnya bersama kesulitan ada kemudahan.
          </p>
          <p className="text-sm text-slate-400 mt-4">QS Al-Insyirah: 5</p>
        </div>
      )}
      {type === 'dhikr' && (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-5xl font-bold text-emerald-400">33</span>
          </motion.div>
          <p className="text-white/80 text-sm">Subhanallah</p>
        </div>
      )}
    </div>
  );
};

/**
 * =====================================================================
 * MAIN PAGE COMPONENT
 * =====================================================================
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('id');
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const [showSticky, setShowSticky] = useState(false);

  // Calculate dynamic badge text
  const getBadgeText = () => {
    const info = getRamadanInfo();
    const isId = lang === 'id';

    if (info.status === 'during') {
      return isId
        ? `Ramadan Hari ke-${info.currentDay}`
        : `Ramadan Day ${info.currentDay}`;
    } else if (info.status === 'after-eid') {
      return isId ? 'Selamat Idul Fitri' : 'Eid Mubarak';
    } else if (info.status === 'before' && info.countdown) {
      return isId
        ? `Ramadan dimulai dalam ${info.countdown.days} hari`
        : `Ramadan starts in ${info.countdown.days} days`;
    }
    return isId ? 'Marhaban ya Ramadan' : 'Welcome Ramadan';
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = CONTENT[lang];
    for (const k of keys) {
      result = result ? result[k] : null;
    }
    return result || '';
  };

  useEffect(() => {
    setMounted(true);
    document.title = `MyRamadhan | ${lang === 'id' ? 'Ramadan, Tenang.' : 'Ramadan, Calm.'}`;

    return scrollY.on('change', (latest) => {
      setShowSticky(latest > 500);
    });
  }, [lang, scrollY]);

  // Update countdown every second
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const info = getRamadanInfo(now);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // Countdown Unit Component
  const CountdownUnit = ({
    value,
    label,
  }: {
    value: number;
    label: string;
  }) => (
    <div className="flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md w-20 sm:w-24">
      <motion.div
        key={value}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        className="text-2xl sm:text-3xl font-bold text-white font-serif"
      >
        {formatNumber(value)}
      </motion.div>
      <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-sans selection:bg-amber-500/30">
      <NoiseOverlay />
      <StarField />

      {/* Decorative Lanterns - Animated */}
      <Lantern x="8%" delay={0} duration={6} scale={0.8} />
      <Lantern x="25%" delay={1} duration={5} scale={0.6} />
      <Lantern x="85%" delay={0.5} duration={7} scale={0.7} />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-xl font-semibold text-amber-100/90 tracking-wide"
        >
          MyRamadhan.
        </motion.span>
        <div className="flex items-center gap-4">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setLang((l) => (l === 'id' ? 'en' : 'id'))}
            className="text-[10px] font-bold tracking-widest border border-white/10 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors uppercase"
          >
            {lang === 'id' ? 'ID' : 'EN'}
          </motion.button>
        </div>
      </nav>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Floating Glow - Animated Pulse */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"
          />

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight mt-12"
          >
            {t('hero.headline')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            {t('hero.subhead')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold rounded-full hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all duration-300 flex items-center gap-2"
            >
              {t('hero.cta_primary')}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </button>
            <button
              onClick={() =>
                document
                  .getElementById('preview')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="px-8 py-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium tracking-wide group"
            >
              {t('hero.cta_secondary')}
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </motion.div>

          {/* NEW COUNTDOWN SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16 flex flex-col items-center"
          >
            {info.status === 'before' && info.countdown ? (
              <div className="flex gap-3 sm:gap-4">
                <CountdownUnit
                  value={info.countdown.days}
                  label={lang === 'id' ? 'Hari' : 'Days'}
                />
                <CountdownUnit
                  value={info.countdown.hours}
                  label={lang === 'id' ? 'Jam' : 'Hours'}
                />
                <CountdownUnit
                  value={info.countdown.minutes}
                  label={lang === 'id' ? 'Menit' : 'Mins'}
                />
                <CountdownUnit
                  value={info.countdown.seconds}
                  label={lang === 'id' ? 'Detik' : 'Secs'}
                />
              </div>
            ) : (
              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <span className="text-xl sm:text-2xl font-serif text-amber-400">
                  {getBadgeText()}
                </span>
              </div>
            )}

            {info.status === 'before' && (
              <p className="mt-6 text-sm text-slate-500 flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-500/60" />
                {lang === 'id'
                  ? 'Menuju Maghrib Ramadan 1446H'
                  : 'Countdown to Maghrib Ramadan 1446H'}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-6 mt-12 text-xs text-slate-500"
          >
            {(t('hero.trust') as string[]).map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full" />{' '}
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: WHISPER --- */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto text-center"
        >
          <Leaf className="w-8 h-8 text-emerald-500/40 mx-auto mb-6" />
          <p className="font-serif text-2xl md:text-3xl text-white/80 italic leading-relaxed mb-4">
            "{t('whisper.text')}"
          </p>
          <p className="text-sm text-slate-500">{t('whisper.note')}</p>
        </motion.div>
      </section>

      {/* --- SECTION 3 & 4: MANIFESTO (PROBLEM + PROMISE) --- */}
      <section className="py-20 px-6">
        {/* Problem Vignette */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-24"
        >
          <p className="text-amber-400/80 text-sm tracking-widest uppercase mb-4 text-center">
            {t('problem.title')}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {(t('problem.points') as any[]).map((p, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <p className="font-serif text-xl text-white mb-2">{p.t}</p>
                <p className="text-sm text-slate-400">{p.d}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Promise Vignette */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <Heart className="w-10 h-10 text-rose-400/40 mx-auto mb-6" />
          <p className="text-amber-400/80 text-sm tracking-widest uppercase mb-4">
            {t('promise.title')}
          </p>
          <p className="font-serif text-2xl md:text-3xl text-white/90 leading-relaxed mb-6">
            {t('promise.text')}
          </p>
          <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400">
            {t('promise.badge')}
          </span>
        </motion.div>
      </section>

      {/* --- SECTION 5: PRODUCT PREVIEW --- */}
      <section id="preview" className="py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-amber-400/80 text-sm tracking-widest uppercase mb-2">
            Experience Peace
          </p>
          <p className="text-slate-400 text-sm">Swipe to explore →</p>
        </motion.div>

        {/* Horizontal Scroll Gallery */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-8">
          <div className="w-8 shrink-0" />
          <MockupCard type="count" />
          <MockupCard type="quote" />
          <MockupCard type="dhikr" />
          <MockupCard type="count" />
          <MockupCard type="quote" />
          <div className="w-8 shrink-0" />
        </div>
      </section>

      {/* --- SECTION 6: A DAY FLOW --- */}
      <section className="py-20 px-6">
        <p className="text-amber-400/80 text-sm tracking-widest uppercase mb-8 text-center">
          {t('day_flow.title')}
        </p>

        <MoonTimeline />

        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6 mt-8">
          {(t('day_flow.steps') as any[]).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">
                  {step.time}
                </p>
                <p className="font-serif text-lg text-white mb-2">
                  {step.title}
                </p>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>

              {/* Timeline Node */}
              <div className="w-3 h-3 bg-amber-500/40 rounded-full mx-auto mt-4 border-2 border-amber-500/60" />

              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- SECTION 7: FEATURE STORY BLOCKS --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const f = t(`features.${num}`) as any;
            const icons = [Clock, VolumeX, BookOpen, Heart, Shield, Share2];
            const Icon = icons[num - 1] || Moon;

            return (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: num * 0.05 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <p className="font-serif text-lg text-white mb-2">{f.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* --- SECTION 8 & 9: STREAK & REMINDERS --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="absolute left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-8 relative">
            {/* Gentle Streak */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-2 mb-6">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      i < 5
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <p className="font-serif text-xl text-white mb-2">
                {t('streak.title')}
              </p>
              <p className="text-sm text-slate-400">{t('streak.desc')}</p>
            </motion.div>

            {/* Respectful Reminders */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <VolumeX className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="font-serif text-xl text-white mb-2">
                {t('reminders.title')}
              </p>
              <p className="text-sm text-slate-400 mb-4">
                {t('reminders.desc')}
              </p>
              <p className="text-xs text-slate-500">{t('reminders.limit')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 10: PRIVACY --- */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Shield className="w-12 h-12 text-emerald-500/40 mx-auto mb-6" />
        </motion.div>
        <p className="font-serif text-2xl md:text-3xl text-white mb-8">
          {t('privacy.title')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {(t('privacy.bullets') as string[]).map((b, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-white/5 rounded-full text-sm text-slate-300 border border-white/5"
            >
              {b}
            </span>
          ))}
        </div>
        <button className="text-sm text-amber-400 hover:underline">
          {t('privacy.cta')}
        </button>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {(t('testimonials') as any[]).map((tm, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <p className="text-amber-400 text-2xl font-serif mb-2">"</p>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                {tm.t}
              </p>
              <p className="text-xs text-slate-500">— {tm.u}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- SECTION 11: FAQ --- */}
      <section className="py-20 px-6">
        <p className="font-serif text-2xl text-white text-center mb-12">
          {t('faq.title')}
        </p>
        <div className="max-w-2xl mx-auto space-y-4">
          {(t('faq.items') as any[]).map((item, i) => (
            <details
              key={i}
              className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer"
            >
              <summary className="flex items-center justify-between text-white font-medium list-none">
                {item.q}
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-slate-400 mt-4 leading-relaxed"
              >
                {item.a}
              </motion.p>
            </details>
          ))}
        </div>
      </section>

      {/* --- SECTION 12: FINAL CTA --- */}
      <section className="relative py-32 px-6">
        {/* Abstract Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center max-w-xl mx-auto"
        >
          <p className="font-serif text-3xl md:text-4xl text-white mb-4">
            {t('final.title')}
          </p>
          <p className="text-slate-400 mb-10">{t('final.sub')}</p>

          <button
            onClick={() => navigate('/auth')}
            className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold text-lg rounded-full hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-all duration-300"
          >
            {t('final.cta')}
          </button>

          <p className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" /> {t('final.micro')}
          </p>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="flex flex-wrap items-center justify-center gap-8 mb-6 text-sm text-slate-500">
          <a href="#" className="hover:text-white transition-colors">
            Instagram
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Twitter
          </a>
          <a href="#" className="hover:text-white transition-colors">
            GitHub
          </a>
        </div>
        <p className="text-center text-xs text-slate-600">
          © {new Date().getFullYear()} MyRamadhanKu. Open Source Project.
        </p>
      </footer>

      {/* --- STICKY MOBILE CTA --- */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/90 backdrop-blur-md border-t border-white/10 md:hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-300">{t('sticky.text')}</span>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold rounded-full text-sm"
              >
                {t('sticky.cta')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
