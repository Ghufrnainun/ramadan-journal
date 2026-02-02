# MyRamadhanku 🌙

Aplikasi pendamping ibadah Ramadhan untuk Muslim di Indonesia. Dibangun dengan React, TypeScript, dan Tailwind CSS.

## Fitur

- 📿 **Dzikir & Doa** - Koleksi dzikir dan doa harian dengan penghitung
- 📖 **Tadarus** - Baca Al-Quran digital dengan audio dan terjemahan
- 🕌 **Jadwal Sholat** - Waktu sholat akurat untuk seluruh kota di Indonesia
- 📅 **Imsakiyah** - Jadwal imsak dan buka puasa
- ✅ **Daily Tracker** - Pantau ibadah harian: sholat, tadarus, dzikir, sedekah
- 🌅 **Countdown** - Hitung mundur waktu berbuka & sahur
- 💬 **Quote Harian** - Motivasi dari Al-Quran dan Hadits

## Teknologi

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Animation**: Framer Motion
- **Backend**: Lovable Cloud (Supabase)
- **Auth**: Google OAuth

## API Credits

Aplikasi ini menggunakan **[eQuran.id API](https://equran.id/apidev)** untuk data islami:

| API Endpoint | Kegunaan |
|--------------|----------|
| `/v2/surat` | Data Al-Quran (114 surat, ayat, audio, terjemahan) |
| `/v2/tafsir` | Tafsir Al-Quran |
| `/v2/doa` | Koleksi doa harian dari Al-Quran & Sunnah |
| `/v2/shalat/kota` | Daftar kota Indonesia untuk jadwal sholat |
| `/v2/shalat/jadwal` | Jadwal waktu sholat harian |
| `/v2/imsakiyah` | Jadwal imsakiyah Ramadhan |

Terima kasih kepada tim [eQuran.id](https://equran.id) atas API gratisnya! 🙏

## Menjalankan Lokal

```bash
# Clone repository
git clone <YOUR_GIT_URL>

# Masuk ke direktori
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

## Struktur Proyek

```
src/
├── components/      # Komponen UI reusable
│   ├── dashboard/   # Komponen untuk dashboard
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utilities & helpers
│   └── api/         # API clients (eQuran, etc.)
├── pages/           # Halaman aplikasi
│   └── onboarding/  # Flow onboarding
└── data/            # Static data (quotes, cities)
```

## Lisensi

MIT License - Gunakan dengan bebas untuk kebaikan.

---

Dibuat dengan ❤️ untuk umat Muslim Indonesia
