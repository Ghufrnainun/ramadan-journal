

# Login Required + Demo Mode Strategy

## Konsep Baru

Mengubah flow aplikasi dari **full guest mode** menjadi **login required** dengan demo singkat untuk non-authenticated users.

| Aspek | Sebelum (Guest Mode) | Sesudah (Login Required) |
|-------|---------------------|--------------------------|
| **Akses Fitur** | Full access tanpa login | Harus login untuk semua fitur |
| **Data Storage** | Dual: localStorage + Supabase | Single: Supabase only |
| **Demo** | Tidak ada | Interactive demo preview |
| **Onboarding** | Sebelum login | Setelah login |

---

## User Flow Baru

```text
Landing Page (/)
       │
       ▼
  ┌─────────────────────────────────┐
  │    "Lihat Demo" (tanpa login)   │──────┐
  │    "Mulai Tracking" (login)     │      │
  └─────────────────────────────────┘      │
              │                             │
              ▼                             ▼
       ┌──────────┐               ┌──────────────────┐
       │  Auth    │               │   Demo Page      │
       │  Page    │               │   (read-only)    │
       └──────────┘               └──────────────────┘
              │                             │
              ▼                             │
       ┌──────────┐                         │
       │ Onboard- │                         │
       │   ing    │                         │
       └──────────┘                 "Daftar Sekarang"
              │                             │
              ▼                             │
       ┌──────────┐                         │
       │Dashboard │◄────────────────────────┘
       │ (Full)   │
       └──────────┘
```

---

## Bagian 1: Demo Page (Baru)

Halaman interaktif yang menunjukkan fitur-fitur utama **tanpa perlu login**. Data dummy/static.

### Demo Screens

1. **Demo Dashboard**
   - Mock countdown ke Maghrib (static)
   - Sample prayer times card
   - Sample quote card
   - Disabled quick actions

2. **Demo Dhikr**
   - Functional counter (tidak disimpan)
   - 3 preset dhikr
   - Haptic feedback tetap jalan

3. **Demo Tracker** 
   - Sample checklist items
   - Toggle works tapi tidak persist
   - Progress bar animasi

### UI Demo Page

```text
┌─────────────────────────────────────────────────────────────┐
│  ⚡ MODE DEMO                              [Daftar Gratis →]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Coba fitur-fitur MyRamadhan tanpa membuat akun.           │
│  Data tidak akan tersimpan.                                 │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│  │Dashboard│  │ Dzikir  │  │ Tracker │                     │
│  └─────────┘  └─────────┘  └─────────┘                     │
│                                                             │
│         [Demo content appears here]                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Suka? Daftar gratis untuk menyimpan progressmu     │   │
│  │              [Daftar dengan Google]                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### New Files for Demo
- `src/pages/DemoPage.tsx` — Demo container dengan tabs
- `src/components/demo/DemoDashboard.tsx` — Mock dashboard
- `src/components/demo/DemoDhikr.tsx` — Functional counter tanpa save
- `src/components/demo/DemoTracker.tsx` — Mock tracker

---

## Bagian 2: Auth Flow Changes

### Landing Page Updates
- "Mulai Jurnal Ramadan" → Redirect ke `/auth` (bukan `/onboarding`)
- Tambah button "Lihat Demo" → Redirect ke `/demo`

### Auth Page Updates  
- Remove "Continue as Guest" button
- Hanya Google Sign In (sudah ada)
- Setelah sign in → `/onboarding`

### Protected Routes
Semua halaman utama require authentication:
- `/dashboard`
- `/quran`
- `/dhikr`
- `/doa`
- `/tracker`
- `/reflection`
- `/calendar`
- `/hadith`
- `/settings`
- `/bookmarks`

### Route Protection Component

```typescript
// src/components/ProtectedRoute.tsx
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return children;
};
```

### App.tsx Route Updates

```typescript
<Route path="/demo" element={<DemoPage />} />
<Route path="/dashboard" element={
  <ProtectedRoute><DashboardPage /></ProtectedRoute>
} />
// ... semua route lain dibungkus ProtectedRoute
```

---

## Bagian 3: Storage Simplification

### Remove Guest Mode Storage Logic
Tidak perlu lagi maintain localStorage untuk data utama.

**Files to Simplify:**
- `src/lib/storage.ts` — Hapus guest mode logic, hanya untuk UI preferences
- `src/lib/profile-sync.ts` — Simplify, no need to merge
- `src/lib/tracker-storage.ts` — Remove localStorage, Supabase only
- `src/lib/dhikr-storage.ts` — Remove localStorage, Supabase only
- `src/lib/reading-progress.ts` — Remove localStorage, Supabase only
- `src/lib/reflection-storage.ts` — Remove localStorage, Supabase only

### Keep Local Storage For:
- UI preferences sementara (language, theme)
- Cached API responses
- Demo mode state

### Database-First Approach
Semua data disimpan langsung ke Supabase:
- `profiles` — User profile data
- `daily_tracker` — Daily checklist
- `dhikr_sessions` — Dhikr counts
- `reading_progress` — Quran progress
- (New tables untuk fitur baru)

---

## Bagian 4: Onboarding Flow Update

### Current Flow (Guest)
`Landing → Auth (optional) → Onboarding → Dashboard`

### New Flow (Login Required)
`Landing → Auth (required) → Onboarding → Dashboard`

### Onboarding Changes
- Remove guest-specific messaging
- Data langsung save ke Supabase (user sudah login)
- No need for "sync on login" logic

---

## Bagian 5: Benefits

| Benefit | Dampak |
|---------|--------|
| **Simpler Codebase** | Hapus dual storage logic, less bugs |
| **Better Data Integrity** | Single source of truth (Supabase) |
| **Cross-Device Sync** | Otomatis dari awal |
| **Analytics Ready** | Semua user teridentifikasi |
| **Demo for Conversion** | Tetap bisa coba sebelum daftar |

---

## Implementation Phases

### Phase 1: Create Demo Page (2-3 jam)
- Buat DemoPage.tsx dengan tabs
- Buat demo components (dashboard, dhikr, tracker)
- Static/mock data

### Phase 2: Auth Flow Updates (1-2 jam)
- Update LandingPage CTAs
- Remove "Continue as Guest" dari AuthPage
- Create ProtectedRoute component
- Wrap semua routes

### Phase 3: Storage Cleanup (3-4 jam)
- Refactor storage modules ke Supabase-only
- Remove localStorage fallbacks untuk data utama
- Simplify profile-sync.ts
- Update semua pages yang pakai getProfile()

### Phase 4: Testing & Polish (1-2 jam)
- Test auth flow end-to-end
- Test demo mode
- Verify data persistence

**Total Estimated: 7-11 jam kerja**

---

## Files Changed Summary

### New Files
- `src/pages/DemoPage.tsx`
- `src/components/demo/DemoDashboard.tsx`
- `src/components/demo/DemoDhikr.tsx`
- `src/components/demo/DemoTracker.tsx`
- `src/components/ProtectedRoute.tsx`

### Modified Files
- `src/App.tsx` — Add routes, wrap with ProtectedRoute
- `src/pages/LandingPage.tsx` — Update CTAs
- `src/pages/AuthPage.tsx` — Remove guest option
- `src/pages/OnboardingPage.tsx` — Simplify (always logged in)
- `src/lib/storage.ts` — Simplify to preferences only
- `src/lib/profile-sync.ts` — Simplify sync logic
- `src/lib/tracker-storage.ts` — Supabase-first
- `src/lib/dhikr-storage.ts` — Supabase-first
- `src/lib/reading-progress.ts` — Supabase-first
- All page components — Remove onboardingCompleted checks, use ProtectedRoute

---

## Demo Page Content Details

### Tab 1: Dashboard Demo
```text
Mock data:
- Location: "Jakarta Selatan, DKI Jakarta"
- Next prayer: Maghrib 17:48 (countdown)
- Quote: Static inspirational quote
- Quick actions: Visible but show "Login to access" tooltip
```

### Tab 2: Dhikr Demo
```text
Functional:
- Counter button works (haptic + animation)
- 3 presets: Subhanallah, Alhamdulillah, Allahu Akbar
- Target: 33 each

Not saved:
- Progress resets on tab switch
- Banner: "Login untuk menyimpan progress"
```

### Tab 3: Tracker Demo
```text
Mock items:
- ☑️ Sholat Subuh
- ☐ Sholat Dzuhur  
- ☐ Puasa Hari Ini
- ☐ Baca Quran

Interactive:
- Toggle works temporarily
- Progress bar animates
- Data resets on leave
```

---

## Questions

Sebelum implementasi, ada beberapa hal yang perlu dikonfirmasi:

1. **Fitur demo mana yang paling penting?** Dashboard saja, atau include Dhikr counter yang functional?

2. **Apakah perlu "preview" Quran reader di demo?** (Ini lebih complex karena butuh API call)

3. **Email/password signup** perlu ditambah, atau Google only sudah cukup?

