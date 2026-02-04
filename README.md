# MyRamadhan Journal

Aplikasi pendamping ibadah Ramadhan untuk Muslim di Indonesia.

## Fitur Utama

- Dzikir dan doa harian
- Tadarus Al-Quran digital
- Jadwal sholat per kota di Indonesia
- Imsakiyah Ramadhan
- Daily tracker ibadah
- Countdown sahur dan berbuka
- Kutipan harian Islami

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- Supabase (auth + backend)

## API Credits

Proyek ini memakai [eQuran.id API](https://equran.id/apidev) untuk data islami:

- `/api/v2/surat`
- `/api/v2/tafsir`
- `/api/doa`
- `/api/v2/shalat`
- `/api/v2/imsakiyah`

Terima kasih untuk tim eQuran.id.

## Menjalankan Lokal

Prasyarat:

- Node.js 20+ (disarankan)
- npm 10+ (atau versi bawaan Node.js terbaru)

Langkah:

```bash
git clone <YOUR_GIT_URL>
cd ramadan-journal
npm install
```

Buat file `.env` (atau `.env.local`) dengan variabel berikut:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Jalankan development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - jalankan app lokal
- `npm run build` - build production
- `npm run preview` - preview hasil build
- `npm run lint` - lint semua file
- `npm run test` - jalankan unit test sekali
- `npm run test:watch` - jalankan unit test mode watch

## Struktur Folder (Ringkas)

```text
src/
  components/   UI reusable dan dashboard blocks
  hooks/        custom React hooks
  lib/          helper, storage, API layer
  pages/        route-level pages
  integrations/ supabase client integration
public/
  sw.js         service worker PWA
```

## Contributing

Kontribusi sangat terbuka.

1. Fork repo ini.
2. Buat branch baru dari `main`:
   - `feat/nama-fitur`
   - `fix/nama-perbaikan`
3. Install dependency lalu jalankan:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
4. Commit perubahan dengan pesan yang jelas.
5. Push branch dan buka Pull Request.

Checklist sebelum PR:

- Scope perubahan fokus (tidak campur banyak hal)
- Tidak ada error lint/test/build
- Ada deskripsi perubahan dan alasan
- Sertakan screenshot jika ada perubahan UI

## Lisensi

MIT License.
