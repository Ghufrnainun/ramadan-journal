

## Fitur 1: Push Notification yang Lebih Reliable

### Kondisi Saat Ini
Aplikasi sudah punya sistem reminder di `RemindersBanner.tsx` yang menggunakan `new Notification()` langsung dari halaman. Masalahnya, notifikasi ini **hanya muncul kalau app sedang dibuka di browser**. Kalau user menutup tab, tidak ada notifikasi yang keluar.

### Yang Akan Ditambahkan
Meningkatkan notifikasi agar bisa muncul **walaupun app tidak sedang dibuka**, menggunakan Service Worker yang sudah ada (`sw.js`).

**Cara kerja:**
- Saat user mengaktifkan reminder di Settings, app akan minta izin notifikasi (sudah ada tombolnya)
- `RemindersBanner.tsx` akan mengirim jadwal notifikasi ke Service Worker via `postMessage`
- Service Worker akan menampilkan notifikasi menggunakan `self.registration.showNotification()` yang lebih reliable
- Notifikasi tetap muncul walau tab tertutup (selama browser masih berjalan di background)

### Perubahan Teknis

**File: `public/sw.js`**
- Tambahkan listener `message` untuk menerima jadwal reminder dari app
- Simpan jadwal di variabel dan gunakan `setTimeout` untuk trigger notifikasi
- Tambahkan handler `notificationclick` agar klik notifikasi membuka app

**File: `src/components/dashboard/RemindersBanner.tsx`**
- Ubah dari `new Notification()` menjadi kirim pesan ke Service Worker
- Service Worker yang akan menampilkan notifikasi
- Tambahkan logika untuk mengirim ulang jadwal setiap kali waktu sholat berubah

**File: `src/pages/SettingsPage.tsx`**
- Perbaiki tombol "Aktifkan Notifikasi" agar juga register Service Worker jika belum
- Tampilkan status permission saat ini (granted/denied/default)

---

## Fitur 2: Share Card Progress Ramadan

### Kondisi Saat Ini
Aplikasi **sudah punya** generator share card Canvas di `src/lib/share-card.ts` dan tombol share di halaman Tracker dan Reflection. Tapi **belum ada** share card yang menampilkan progress harian dari Dashboard (misal: "Hari ke-15, sudah khatam 20 juz").

### Yang Akan Ditambahkan
Tombol "Share Progress" di halaman **Dashboard** dan **Stats** yang menghasilkan kartu bergambar berisi ringkasan progress Ramadan user.

**Konten share card:**
- Hari ke-berapa Ramadan
- Total puasa, tarawih, sedekah
- Progress Quran (juz ke berapa)
- Streak aktif
- Hashtag #MyRamadhan

### Perubahan Teknis

**File: `src/lib/share-card.ts`**
- Tambahkan fungsi baru `generateDailyProgressCard(stats, lang)` yang membuat kartu format IG Story (1080x1920) dengan info:
  - "Hari ke-X Ramadan"
  - Progress puasa, tarawih, sedekah, Quran
  - Streak
  - Branding MyRamadhanku

- Tambahkan fungsi `getDailyProgressStats()` yang mengambil:
  - Hari ke-berapa dari `ramadanStartDate`
  - Total fasting, tarawih, sedekah dari database
  - Progress Quran terkini
  - Streak aktif

**File: `src/pages/DashboardPage.tsx`**
- Tambahkan tombol "Share Progress" (ikon Share) di header atau di bawah CountdownCard
- Klik tombol -> generate card -> buka share dialog (atau download)

**File: `src/pages/StatsPage.tsx`**
- Tambahkan tombol "Share Stats" di halaman statistik
- Menggunakan `generateWeeklySummaryCard` yang sudah ada

### Ringkasan File yang Diubah

| File | Perubahan |
|------|-----------|
| `public/sw.js` | Tambah handler notifikasi via Service Worker |
| `src/components/dashboard/RemindersBanner.tsx` | Kirim jadwal ke SW, bukan `new Notification()` |
| `src/pages/SettingsPage.tsx` | Tampilkan status izin notifikasi |
| `src/lib/share-card.ts` | Tambah `generateDailyProgressCard` dan `getDailyProgressStats` |
| `src/pages/DashboardPage.tsx` | Tambah tombol Share Progress |
| `src/pages/StatsPage.tsx` | Tambah tombol Share Stats |

