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
  Settings,
  Github,
  Calendar,
  Target,
  HandHeart,
  Camera,
  Flame,
  PenLine,
} from 'lucide-react';
import { getRamadanInfo } from '@/lib/ramadan-dates';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/runtime-client';
import { getProfile } from '@/lib/storage';

/**
 * =====================================================================
 * DATA & TRANSLATIONS
 * =====================================================================
 */
type Lang = 'id' | 'en';

const CONTENT = {
  id: {
    hero: {
      label: 'Your Ramadan Companion',
      headline: 'Raih Ramadan Terbaikmu.',
      subhead:
        'Track ibadah harianmu, pantau progress Quran, dan jaga konsistensi dengan companion app yang selalu menemanimu.',
      cta_primary: 'Mulai Tracking',
      cta_secondary: 'Lihat Demo',
      trust: ['Track Progress', 'Gratis Selamanya', 'Tanpa Iklan'],
      countdown: 'Ramadan dimulai dalam ±32 hari',
    },
    whisper: {
      text: 'Malam ini, izinkan dirimu istirahat. Tidak perlu mengejar angka, cukup hadir dengan hati.',
      note: 'Menunggu sidang Isbat untuk kepastian tanggal.',
    },
    problem: {
      title: 'Masalah Aplikasi Ramadan Lain',
      points: [
        {
          t: 'Susah Konsisten',
          d: '30 hari terasa panjang tanpa tracking yang jelas',
        },
        {
          t: 'Lupa Progress Quran',
          d: 'Sudah sampai juz berapa? Susah diingat',
        },
        {
          t: 'Target Tak Tercapai',
          d: 'Ibadah terasa random tanpa checklist harian',
        },
      ],
    },
    promise: {
      title: 'Companion yang Menemanimu',
      text: 'Kami ada di setiap sahur, sholat, dan buka puasa. 30 hari penuh.',
      badge: 'Konsistensi Tanpa Tekanan',
    },
    day_flow: {
      title: 'Rutinitas Tenang',
      steps: [
        {
          time: 'Sahur',
          title: 'Niat & Doa',
          desc: 'Satu doa pendek untuk memulai hari dengan sadar.',
        },
        {
          time: 'Siang',
          title: 'Cek Ibadah',
          desc: 'Tandai sholat & puasa tanpa tekanan.',
        },
        {
          time: 'Sore',
          title: 'Jelang Buka',
          desc: 'Hitung mundur tenang & doa berbuka.',
        },
        {
          time: 'Malam',
          title: 'Refleksi Syukur',
          desc: 'Tulis satu hal yang disyukuri hari ini.',
        },
      ],
    },
    features: {
      1: {
        title: 'Track Sholat',
        desc: 'Tandai 5 waktu sholat setiap hari dengan mudah.',
      },
      2: {
        title: 'Progress Quran',
        desc: 'Pantau tadarus juz & halaman dengan visual progress bar.',
      },
      3: {
        title: 'Streak Puasa',
        desc: 'Catat puasa harianmu dan bangun streak 30 hari.',
      },
      4: {
        title: 'Dzikir Counter',
        desc: 'Hitung dzikir dengan haptic feedback & animasi.',
      },
      5: {
        title: 'Jadwal Akurat',
        desc: 'Waktu sholat & imsakiyah sesuai lokasi real-time.',
      },
      6: {
        title: 'Refleksi Harian',
        desc: 'Jurnal malam untuk menutup hari dengan syukur.',
      },
    },
    streak: {
      title: 'Konsistensi',
      desc: 'Jika terlewat satu hari, tidak apa-apa. Mulai lagi lusa. Kami tidak memutus rantaimu.',
      label: 'Perjalanan 30 Hari',
    },
    reminders: {
      title: 'Notifikasi Santun',
      desc: 'Kami hanya mengingatkan waktu sholat jika diminta. Tidak ada spam "ayo buka aplikasi".',
      limit: '*iOS mungkin membatasi notifikasi web',
    },
    privacy: {
      title: 'Privasi Tanpa Kompromi',
      bullets: [
        'Tidak Perlu Login (Mode Tamu)',
        'Data di Local Storage HP Anda',
        'Kode Sumber Terbuka (Transparan)',
      ],
      cta: 'Pelajari Teknisnya',
    },
    faq: {
      title: 'Pertanyaan yang Sering Muncul',
      items: [
        {
          q: 'Benar-benar gratis selamanya?',
          a: 'Ya. Proyek ini adalah wakaf digital. Tidak akan ada fitur berbayar.',
        },
        {
          q: 'Kalau ganti HP bagaimana?',
          a: 'Gunakan fitur "Sync" opsional untuk memidahkan data. Defaultnya ada di HP lama.',
        },
        {
          q: 'Bisa dipakai offline?',
          a: 'Bisa banget. Jurnal, tracker, dan dzikir jalan tanpa internet.',
        },
        {
          q: 'Siapa yang membuat ini?',
          a: 'Komunitas developer muslim yang lelah dengan aplikasi penuh iklan.',
        },
        {
          q: 'Apakah data saya dijual?',
          a: 'Tidak. Kami bahkan tidak punya server analitik untuk melacakmu.',
        },
      ],
    },
    final: {
      title: 'Siap Raih Ramadan Terbaikmu?',
      sub: 'Mulai tracking progress harianmu hari ini. Gratis, selamanya.',
      cta: 'Daftar Sekarang',
      micro: 'Gratis • Tanpa Iklan • Open Source',
    },
    sticky: {
      text: 'Mulai Jurnal Ramadan (Gratis)',
      cta: 'Buka App',
    },
    testimonials: [
      {
        t: 'Jujur, ini satu-satunya app Ramadan yang nggak bikin HP panas karena iklan.',
        u: 'Rina, Pengguna Android',
      },
      {
        t: 'Fitur dzikirnya enak banget, ada getarnya jadi berasa pegang tasbih fisik.',
        u: 'Dimas, Desainer Grafis',
      },
      {
        t: 'Suka banget karena nggak ada leaderboard. Ibadah jadi buat Allah, bukan buat skor.',
        u: 'Fauzan, Mahasiswa',
      },
    ],
  },
  en: {
    hero: {
      label: 'Digital Worship Companion',
      headline: 'A Peaceful Ramadan, Without the Digital Noise.',
      subhead:
        'Focus on worship and peace of heart with a privacy-first journal. No ads, no leaderboards, 100% offline-ready.',
      cta_primary: 'Start Ramadan Journal',
      cta_secondary: 'Preview App',
      trust: ['Data Stored Locally', 'Ad-Free', 'Open Source'],
      countdown: 'Ramadan starts in ±32 days',
    },
    whisper: {
      text: 'Tonight, give yourself permission to rest. No need to chase numbers, just be present.',
      note: 'Waiting for official sighting (Sidang Isbat).',
    },
    problem: {
      title: 'The Problem with Other Apps',
      points: [
        {
          t: 'Noisy Notifications',
          d: 'Ads popping up right when you are trying to pray.',
        },
        {
          t: 'Too Competitive',
          d: 'Leaderboards make worship feel like a contest.',
        },
        { t: 'Bloated Features', d: 'Too many confusing tools you never use.' },
      ],
    },
    promise: {
      title: 'Our Promise to You',
      text: 'A silent digital space. We don’t track your data, sell your attention, or judge your progress.',
      badge: 'Judgment-Free Zone',
    },
    day_flow: {
      title: 'A Calm Routine',
      steps: [
        {
          time: 'Suhoor',
          title: 'Intention',
          desc: 'One short dua to start the day consciously.',
        },
        {
          time: 'Noon',
          title: 'Worship Check',
          desc: 'Mark prayers & fasting without pressure.',
        },
        {
          time: 'Evening',
          title: 'Pre-Iftar',
          desc: 'Calm countdown & breaking fast dua.',
        },
        {
          time: 'Night',
          title: 'Gratitude',
          desc: 'Write one thing you are grateful for today.',
        },
      ],
    },
    features: {
      1: {
        title: 'Track Prayers',
        desc: 'Mark 5 daily prayers easily without pressure.',
      },
      2: {
        title: 'Quran Progress',
        desc: 'Monitor juz & pages with visual progress bar.',
      },
      3: {
        title: 'Fasting Streak',
        desc: 'Log your fasting and build a 30-day streak.',
      },
      4: {
        title: 'Dhikr Counter',
        desc: 'Count dhikr with haptic feedback & animations.',
      },
      5: {
        title: 'Accurate Schedules',
        desc: 'Prayer times & imsakiyah based on your location.',
      },
      6: {
        title: 'Daily Reflection',
        desc: 'Evening journal to end your day with gratitude.',
      },
    },
    streak: {
      title: 'Consistency',
      desc: 'Missed a day? It’s okay. Start again tomorrow. We won’t break your chain.',
      label: '30 Days Journey',
    },
    reminders: {
      title: 'Polite Notifications',
      desc: 'We only remind you of prayer times if asked. No "open the app" spam.',
      limit: '*iOS browsers may limit web notifications',
    },
    privacy: {
      title: 'Uncompromised Privacy',
      bullets: [
        'Data Stays on Your Device',
        'No Ads, Ever',
        'Open Source Code',
      ],
      cta: 'See Technical Details',
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          q: 'Is it really free forever?',
          a: 'Yes. This is a digital waqf project. No paid features ever.',
        },
        {
          q: 'What if I change phones?',
          a: 'Use the optional "Sync" feature. Default data stays on the old phone.',
        },
        {
          q: 'Does it work offline?',
          a: 'Absolutely. Journal, tracker, and dhikr work without internet.',
        },
        {
          q: 'Who made this?',
          a: 'A community of Muslim developers tired of ad-filled apps.',
        },
        {
          q: 'Is my data sold?',
          a: 'No. We don’t even have analytics servers to track you.',
        },
      ],
    },
    final: {
      title: 'Ready for Your Best Ramadan?',
      sub: 'Start tracking your progress today. Free, forever.',
      cta: 'Sign Up Now',
      micro: 'Free • No Ads • Open Source',
    },
    sticky: {
      text: 'Start Tracking Your Ramadan',
      cta: 'Get Started',
    },
    testimonials: [
      {
        t: "Finally, a Ramadan app that doesn't heat up my phone with ads.",
        u: 'Rina, Android User',
      },
      {
        t: 'The haptic dhikr feels so good, like holding real beads.',
        u: 'Dimas, Graphic Designer',
      },
      {
        t: 'Love that there is no leaderboard. Worship is for Allah, not for points.',
        u: 'Fauzan, Student',
      },
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
    className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
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
      {stars.map((s) => (
        <motion.div
          key={`${s.top}-${s.left}-${s.size}`}
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
      <div className="w-px h-16 bg-amber-700/60 mx-auto" />

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

const MoonTimeline = React.forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="flex items-center justify-center gap-3 py-8">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`moon-phase-${i}`}
        className="w-3 h-3 rounded-full bg-amber-300"
        style={{ opacity: 0.3 + i * 0.1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
));
MoonTimeline.displayName = 'MoonTimeline';

const MockupCard = React.forwardRef<
  HTMLDivElement,
  { type: 'count' | 'quote' | 'dhikr' }
>(({ type }, ref) => {
  return (
    <div
      ref={ref}
      className="relative w-64 h-[520px] bg-slate-950 rounded-[2.5rem] border-[6px] border-slate-800/80 shadow-2xl overflow-hidden flex-shrink-0"
    >
      {/* Phone Notch */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-20">
        <div className="h-6 w-28 bg-slate-900 rounded-b-2xl" />
      </div>

      {/* Status Bar */}
      <div className="absolute top-1.5 inset-x-0 flex justify-between items-center px-5 text-[10px] text-slate-500 font-medium z-10">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* Screen Content */}
      <div className="h-full w-full bg-[#0a0f1c] relative flex flex-col pt-10 pb-6 px-5">
        {type === 'count' && (
          <div className="h-full flex flex-col items-center justify-center text-center relative">
            {/* Settings Icon */}
            <div className="absolute top-2 right-0">
              <div className="p-2 rounded-full bg-slate-800/40">
                <Settings className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Clock Circle */}
            <motion.div
              className="w-28 h-28 rounded-full bg-slate-800/60 flex items-center justify-center mb-10 relative"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Clock className="w-10 h-10 text-amber-400" />
            </motion.div>

            {/* Time Display */}
            <p className="text-5xl font-bold text-white font-serif tracking-tight">
              04:32
            </p>
            <p className="text-sm text-slate-400 mt-2">Menjelang Maghrib</p>

            {/* Location Tags */}
            <div className="mt-8 flex gap-2 text-[11px] text-slate-400">
              <span className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
                Jakarta
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
                Ashar 15:12
              </span>
            </div>
          </div>
        )}

        {type === 'quote' && (
          <div className="h-full flex flex-col justify-center text-left relative pt-4">
            {/* Quote Icon */}
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mb-8">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>

            {/* Quote Mark */}
            <p className="text-4xl text-emerald-500/30 font-serif absolute top-16 left-0 leading-none">
              "
            </p>

            {/* Quote Text */}
            <p className="text-white/90 font-serif italic text-lg leading-relaxed pl-1">
              Maka sesungguhnya bersama kesulitan ada kemudahan.
            </p>

            {/* Divider */}
            <div className="h-0.5 w-10 bg-amber-500/50 my-5" />

            {/* Source */}
            <p className="text-sm text-amber-400 font-medium">
              QS Al-Insyirah: 5
            </p>

            {/* Action Buttons */}
            <div className="mt-auto pt-8 flex gap-3">
              <button className="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {type === 'dhikr' && (
          <div className="h-full flex flex-col items-center justify-center text-center relative">
            {/* Settings Icon */}
            <div className="absolute top-2 right-0">
              <div className="p-2 rounded-full bg-slate-800/40">
                <Settings className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <p className="absolute top-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
              Dzikir Pagi
            </p>

            {/* Counter Circle */}
            <motion.div
              className="w-40 h-40 rounded-full bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 border-2 border-emerald-500/40 flex items-center justify-center cursor-pointer shadow-[0_0_60px_rgba(16,185,129,0.15)]"
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-5xl font-bold text-emerald-400 font-mono">
                33
              </span>
            </motion.div>

            {/* Label */}
            <p className="text-white text-base font-medium mt-6">Subhanallah</p>
            <p className="text-slate-500 text-sm mt-1">Target: 33</p>

            {/* Progress Bar */}
            <div className="absolute bottom-4 w-full flex justify-center px-8">
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '66%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full" />
    </div>
  );
});
MockupCard.displayName = 'MockupCard';

/**
 * =====================================================================
 * MAIN PAGE COMPONENT
 * =====================================================================
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [lang, setLang] = useState<Lang>('id');
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    // Simple redirect: check local profile (single source of truth)
    const profile = getProfile();
    if (profile.setup_completed_at || profile.onboardingCompleted) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [authLoading, user, navigate]);
  const localized = CONTENT[lang];

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
    let result: unknown = localized;
    for (const k of keys) {
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return '';
      }
    }
    return typeof result === 'string' ? result : '';
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
        {mounted ? formatNumber(value) : '--'}
      </motion.div>
      <span className="text-[10px] sm:text-xs text-slate-400 uppercase mt-1">
        {label}
      </span>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-dvh bg-[#020617] text-slate-200 overflow-x-hidden font-sans selection:bg-amber-500/30">
      <NoiseOverlay />
      <StarField />

      {/* Decorative Lanterns - Animated */}
      <Lantern x="8%" delay={0} duration={6} scale={0.8} />
      <Lantern x="25%" delay={1} duration={5} scale={0.6} />
      <Lantern x="85%" delay={0.5} duration={7} scale={0.7} />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/60 backdrop-blur-sm">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-xl font-semibold text-amber-100/90"
        >
          MyRamadhan.
        </motion.span>
        <div className="flex items-center gap-4">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setLang((l) => (l === 'id' ? 'en' : 'id'))}
            className="text-[10px] font-bold border border-white/10 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/10 transition-colors uppercase"
            aria-label={
              lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'
            }
          >
            {lang === 'id' ? 'ID' : 'EN'}
          </motion.button>
        </div>
      </nav>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative min-h-dvh flex items-center justify-center px-6 pt-24 pb-16">
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
              className="px-10 py-5 bg-amber-500 text-slate-900 font-bold rounded-full hover:bg-amber-400 transition-colors duration-300 flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transform hover:-translate-y-1"
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
              onClick={() => navigate('/demo')}
              className="px-8 py-4 border border-white/20 rounded-full text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium group"
            >
              {lang === 'id' ? 'Lihat Demo' : 'Try Demo'}
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform rotate-[-90deg]" />
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
            {localized.hero.trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full" />{' '}
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: WHISPER --- */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-slate-900/30" />
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
          <p className="text-sm text-slate-400">{t('whisper.note')}</p>
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
          <p className="text-amber-400/80 text-sm uppercase mb-4 text-center">
            {t('problem.title')}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {localized.problem.points.map((p, i) => (
              <div
                key={p.t}
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
          <p className="text-amber-400/80 text-sm uppercase mb-4">
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
          <p className="text-amber-400/80 text-sm uppercase mb-2">
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
        <p className="text-amber-400/80 text-sm uppercase mb-8 text-center">
          {t('day_flow.title')}
        </p>

        <MoonTimeline />

        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6 mt-8">
          {localized.day_flow.steps.map((step, i) => (
            <motion.div
              key={`${step.time}-${step.title}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-amber-400 text-xs uppercase mb-2">
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
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- SECTION 7: FEATURE STORY BLOCKS --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const f =
              localized.features[num as keyof typeof localized.features];
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
                    key={`streak-day-${i + 1}`}
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

      {/* --- SECTION 9B: ADVANCED FEATURES --- */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <p className="text-amber-400/80 text-sm uppercase mb-4">
            Fitur Tambahan
          </p>
          <p className="font-serif text-3xl text-white">
            {lang === 'id'
              ? 'Tracking Lengkap untuk Ramadan Sempurna'
              : 'Complete Tracking for Perfect Ramadan'}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Quran Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <p className="font-serif text-lg text-white mb-2">
              {lang === 'id' ? 'Progress Quran' : 'Quran Progress'}
            </p>
            <p className="text-sm text-slate-400">
              {lang === 'id'
                ? 'Pantau tadarus juz & halaman dengan visual progress bar yang akurat'
                : 'Monitor your juz & pages with accurate visual progress'}
            </p>
          </motion.div>

          {/* Fasting Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="font-serif text-lg text-white mb-2">
              {lang === 'id' ? 'Kalender Puasa' : 'Fasting Calendar'}
            </p>
            <p className="text-sm text-slate-400">
              {lang === 'id'
                ? 'Visualisasi 30 hari puasa dengan status per hari'
                : '30-day fasting calendar with daily status tracking'}
            </p>
          </motion.div>

          {/* Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <p className="font-serif text-lg text-white mb-2">
              {lang === 'id' ? 'Target Ramadan' : 'Ramadan Goals'}
            </p>
            <p className="text-sm text-slate-400">
              {lang === 'id'
                ? 'Tentukan target personal & pantau progres selama 30 hari'
                : 'Set personal goals and track progress throughout Ramadan'}
            </p>
          </motion.div>

          {/* Tarawih Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
              <Moon className="w-6 h-6 text-purple-400" />
            </div>
            <p className="font-serif text-lg text-white mb-2">
              {lang === 'id' ? 'Tarawih Tracker' : 'Tarawih Tracker'}
            </p>
            <p className="text-sm text-slate-400">
              {lang === 'id'
                ? 'Catat sholat tarawih & witir setiap malam'
                : 'Track nightly Tarawih and Witir prayers'}
            </p>
          </motion.div>

          {/* Sedekah */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-rose-500/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-3">
              <HandHeart className="w-6 h-6 text-rose-400" />
            </div>
            <p className="font-serif text-lg text-white mb-2">
              {lang === 'id' ? 'Log Sedekah' : 'Charity Log'}
            </p>
            <p className="text-sm text-slate-400">
              {lang === 'id'
                ? 'Catat sedekah harian & bangun konsistensi berbagi'
                : 'Log daily charity and build giving consistency'}
            </p>
          </motion.div>

          {/* Weekly Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-orange-500/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
              <Share2 className="w-6 h-6 text-orange-400" />
            </div>
            <p className="font-serif text-lg text-white mb-2">
              {lang === 'id' ? 'Share Progress' : 'Share Progress'}
            </p>
            <p className="text-sm text-slate-400">
              {lang === 'id'
                ? 'Bagikan progress mingguan ke sosial media'
                : 'Share your weekly progress on social media'}
            </p>
          </motion.div>
        </div>
      </section>

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
          {localized.privacy.bullets.map((b) => (
            <span
              key={b}
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
          {localized.testimonials.map((tm, i) => (
            <motion.div
              key={tm.u}
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
          {localized.faq.items.map((item, i) => (
            <details
              key={item.q}
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-10 py-5 bg-amber-500 text-slate-900 font-bold text-lg rounded-full hover:bg-amber-400 transition-colors duration-300"
            >
              {t('final.cta')}
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="px-8 py-4 border border-white/20 rounded-full text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              {lang === 'id' ? 'Coba Demo Dulu' : 'Try Demo First'}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" /> {t('final.micro')}
          </p>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-8 px-6 border-t border-slate-800/50 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 MyRamadhanKu. Open Source Project.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Ghufrnainun/ramadan-journal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* --- STICKY MOBILE CTA --- */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe bg-black/90 backdrop-blur-md border-t border-white/10 md:hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-300">{t('sticky.text')}</span>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-full text-sm"
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
