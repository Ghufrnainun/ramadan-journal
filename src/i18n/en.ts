import type { Translations } from './id';

export const en: Translations = {
  // Navigation
  nav: {
    home: 'Home',
    features: 'Features',
    about: 'About',
    faq: 'FAQ',
    startNow: 'Start Now',
    seePreview: 'See Preview',
  },

  // Hero
  hero: {
    countdown: 'Ramadan starts in',
    days: 'days',
    title: 'Your Ramadan',
    subtitle: 'companion',
    description: 'A calm, lightweight Ramadan companion app. No pressure, no judgement.',
    cta: 'Start Now',
    ctaSubtext: 'Start in 30 seconds',
  },

  // Tonight Focus
  tonightFocus: {
    line1: 'Tonight,',
    line2: 'focus on what matters.',
    description: "It's not about how much. It's about how present.",
  },

  // Problem Section
  problem: {
    title: 'You might have felt...',
    items: [
      {
        title: 'Overwhelmed at the start',
        description: 'Too many goals, unsure where to focus.',
      },
      {
        title: 'Losing momentum',
        description: 'Started strong, then slowly faded.',
      },
      {
        title: 'Apps that are too busy',
        description: 'Constant notifications, too many features, more burden than help.',
      },
    ],
  },

  // Promise Section
  promise: {
    title: 'A calm companion',
    subtitle: 'No competition. No pressure.',
    description: "MyRamadhanku is a gentle reminder, not a judging supervisor. You set your own pace.",
  },

  // Preview Section
  preview: {
    title: 'A quick look',
    cards: {
      countdown: {
        title: 'Countdown',
        description: 'Track your Ramadan journey',
      },
      quote: {
        title: 'Daily Quote',
        description: 'Calming reflections',
      },
      checklist: {
        title: 'Ibadah Tracker',
        description: 'Track without scoring',
      },
      dhikr: {
        title: 'Dhikr Counter',
        description: 'Tap, count, remember Him',
      },
    },
  },

  // Daily Flow
  dailyFlow: {
    title: 'Your daily flow',
    times: {
      pagi: {
        title: 'Morning',
        subtitle: 'After Fajr',
        description: 'Start with intention and morning dhikr',
      },
      siang: {
        title: 'Afternoon',
        subtitle: 'Productive hours',
        description: 'Continue with Quran and daily deeds',
      },
      maghrib: {
        title: 'Maghrib',
        subtitle: 'Breaking fast',
        description: 'Gratitude and sharing',
      },
      malam: {
        title: 'Night',
        subtitle: 'After Isha',
        description: 'Reflection and taraweeh',
      },
    },
  },

  // Features
  features: {
    title: 'Gentle features',
    items: [
      {
        title: 'Prayer Times',
        description: 'Imsak to Isha for your city. Lightweight and accurate.',
      },
      {
        title: 'Daily Tracker',
        description: 'Simple checklist without scores or percentages. Just check.',
      },
      {
        title: 'Dhikr Counter',
        description: 'Large tap area. Common dhikr presets. Custom option available.',
      },
      {
        title: 'Tadarus Progress',
        description: 'Track where you left off. Flexible daily targets.',
      },
      {
        title: 'Night Reflection',
        description: 'One question each night. Save as your private journal.',
      },
      {
        title: 'Daily Quote',
        description: 'Contextual reflections. Morning, maghrib, or the last 10 nights.',
      },
    ],
  },

  // Streak
  streak: {
    title: 'Gentle streaks',
    subtitle: 'Ramadan only',
    description: "Maximum 30 days. No \"streak lost\" messaging. You can hide it anytime.",
    note: "This isn't a competition. It's a reminder that you're consistent.",
  },

  // Reminders
  reminders: {
    title: 'Polite reminders',
    subtitle: 'OFF by default',
    description: 'You choose when to be reminded. Silent mode available.',
    limitations: 'Note: Browser notifications only work when the app is open.',
  },

  // Privacy
  privacy: {
    title: 'Your data, your control',
    items: [
      {
        title: 'Guest Mode',
        description: 'Use without an account. All data stays on your device.',
      },
      {
        title: 'Optional Sync',
        description: 'Login if you want to sync across devices.',
      },
      {
        title: 'No Ads',
        description: 'No ads. No data selling. Focus on worship.',
      },
    ],
  },

  // FAQ
  faq: {
    title: 'Common Questions',
    items: [
      {
        question: 'Is it free?',
        answer: 'Yes, completely free. No paid features or ads.',
      },
      {
        question: 'Do I need an account?',
        answer: 'No. You can use it as a guest right away. Account is optional for syncing.',
      },
      {
        question: 'Does it work offline?',
        answer: 'Yes. Most features work offline after the first load.',
      },
      {
        question: 'Where is my data stored?',
        answer: 'Guest mode: on your device. Logged in: on secure encrypted servers.',
      },
      {
        question: 'How are prayer times calculated?',
        answer: 'Using a lightweight API based on your location in Indonesia.',
      },
      {
        question: 'Can I customize the checklist?',
        answer: 'Yes. Add or hide items based on your focus.',
      },
      {
        question: "What's different from other Ramadan apps?",
        answer: 'Focus on calm. No excessive gamification, no leaderboards, no pressure.',
      },
    ],
  },

  // CTA
  cta: {
    title: 'Ready for a calm Ramadan?',
    button: 'Start Now',
    subtext: 'Free. No account needed. Start instantly.',
  },

  // Footer
  footer: {
    tagline: 'A calm Ramadan companion',
    madeWith: 'Made with',
    forUmmah: 'for the ummah',
  },
};
