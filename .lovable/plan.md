
# Complete Feature Implementation Plan
## MyRamadhan - Your Ramadan Companion

---

## Overview

Plan ini mencakup implementasi lengkap fitur-fitur yang sudah direncanakan plus beberapa fitur tambahan untuk melengkapi pengalaman Ramadan tracking.

---

## Part 1: Database Schema (Migration)

### New Tables

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE TABLES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  fasting_log           tarawih_log          sedekah_log                     │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │ id           │     │ id           │     │ id           │                │
│  │ user_id      │     │ user_id      │     │ user_id      │                │
│  │ date         │     │ date         │     │ date         │                │
│  │ status       │     │ tarawih_done │     │ completed    │                │
│  │ notes        │     │ rakaat_count │     │ notes        │                │
│  │ created_at   │     │ witir_done   │     │ created_at   │                │
│  └──────────────┘     │ mosque_name  │     └──────────────┘                │
│                       │ created_at   │                                      │
│                       └──────────────┘                                      │
│                                                                             │
│  ramadan_goals         daily_status          reflections                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │ id           │     │ id           │     │ id           │                │
│  │ user_id      │     │ user_id      │     │ user_id      │                │
│  │ goal_type    │     │ date         │     │ date         │                │
│  │ title        │     │ intention    │     │ prompt_id    │                │
│  │ target       │     │ mood         │     │ content      │                │
│  │ current      │     │ created_at   │     │ mood         │                │
│  │ completed    │     └──────────────┘     │ completed    │                │
│  │ created_at   │                          │ created_at   │                │
│  └──────────────┘                          └──────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SQL Migration

```sql
-- 1. Fasting Log Table
CREATE TABLE fasting_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending',
  -- status: 'full', 'udzur', 'skip', 'pending'
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 2. Tarawih Log Table  
CREATE TABLE tarawih_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  tarawih_done boolean DEFAULT false,
  rakaat_count integer DEFAULT 0,
  witir_done boolean DEFAULT false,
  witir_rakaat integer DEFAULT 0,
  mosque_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 3. Sedekah Log Table
CREATE TABLE sedekah_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 4. Ramadan Goals Table
CREATE TABLE ramadan_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_type text NOT NULL,
  -- goal_type: 'khatam', 'fasting_30', 'tarawih_30', 'sedekah_30', 'custom'
  title text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  current integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Daily Status Table (untuk intention & mood)
CREATE TABLE daily_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  intention text,
  mood text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 6. Reflections Table
CREATE TABLE reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  prompt_id text NOT NULL,
  prompt_text jsonb NOT NULL,
  content text,
  mood text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE fasting_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarawih_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedekah_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ramadan_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern for all tables)
CREATE POLICY "Users manage own fasting_log" ON fasting_log
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own tarawih_log" ON tarawih_log
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own sedekah_log" ON sedekah_log
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own ramadan_goals" ON ramadan_goals
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own daily_status" ON daily_status
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own reflections" ON reflections
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update triggers
CREATE TRIGGER update_fasting_log_updated_at
  BEFORE UPDATE ON fasting_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarawih_log_updated_at
  BEFORE UPDATE ON tarawih_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sedekah_log_updated_at
  BEFORE UPDATE ON sedekah_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ramadan_goals_updated_at
  BEFORE UPDATE ON ramadan_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_status_updated_at
  BEFORE UPDATE ON daily_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Part 2: Storage Refactoring (Supabase-First)

### Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STORAGE ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────────────────────────────────────────┐   │
│  │   React     │────▶│   useSupabaseData() Hook                        │   │
│  │   Component │     │                                                  │   │
│  └─────────────┘     │   - Automatic auth check                        │   │
│                      │   - CRUD operations                             │   │
│                      │   - React Query caching                         │   │
│                      │   - Optimistic updates                          │   │
│                      └─────────────────────────────────────────────────┘   │
│                                        │                                    │
│                                        ▼                                    │
│                      ┌─────────────────────────────────────────────────┐   │
│                      │            Supabase Database                    │   │
│                      │                                                  │   │
│                      │   profiles | daily_tracker | dhikr_sessions     │   │
│                      │   reading_progress | fasting_log | tarawih_log  │   │
│                      │   sedekah_log | ramadan_goals | daily_status    │   │
│                      │   reflections                                    │   │
│                      └─────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### New Hooks Structure

| Hook | Purpose |
|------|---------|
| `useProfile()` | Fetch/update user profile |
| `useFastingLog()` | Fasting calendar CRUD |
| `useTarawihLog()` | Tarawih tracker CRUD |
| `useSedekahLog()` | Sedekah log CRUD |
| `useRamadanGoals()` | Goals CRUD + progress calc |
| `useDailyStatus()` | Daily intention + mood |
| `useReflections()` | Reflections CRUD |
| `useReadingProgress()` | Quran progress CRUD |
| `useDhikrSessions()` | Dhikr sessions CRUD |
| `useDailyTracker()` | Daily checklist CRUD |

### Files to Refactor

| File | Change |
|------|--------|
| `src/lib/storage.ts` | Keep for UI prefs only (theme, language) |
| `src/lib/tracker-storage.ts` | Replace with `useDailyTracker()` hook |
| `src/lib/dhikr-storage.ts` | Replace with `useDhikrSessions()` hook |
| `src/lib/reading-progress.ts` | Replace with `useReadingProgress()` hook |
| `src/lib/reflection-storage.ts` | Replace with `useReflections()` hook |
| `src/lib/daily-status.ts` | Replace with `useDailyStatus()` hook |

### New Files

```text
src/hooks/
├── useProfile.ts
├── useFastingLog.ts
├── useTarawihLog.ts
├── useSedekahLog.ts
├── useRamadanGoals.ts
├── useDailyStatus.ts
├── useReflections.ts
├── useReadingProgress.ts
├── useDhikrSessions.ts
└── useDailyTracker.ts
```

---

## Part 3: Dashboard Components

### 3.1 Quran Progress Card

Visual tracking progress baca Al-Quran.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  QURAN PROGRESS CARD                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BookOpen Icon                                                      │   │
│  │                                                                      │   │
│  │  Progress Tadarus                                                    │   │
│  │                                                                      │   │
│  │  ████████████████░░░░░░░░░░░░░░ 53%                                 │   │
│  │  Juz 16 dari 30                                                      │   │
│  │                                                                      │   │
│  │  MapPin Terakhir: Al-Kahfi:45                                       │   │
│  │                                                                      │   │
│  │  [Lanjutkan Membaca]                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**File:** `src/components/dashboard/QuranProgressCard.tsx`

**Features:**
- Visual progress bar (0-100%)
- Juz indicator (1-30)
- Last read position (Surah:Ayah)
- Quick link to continue reading
- Auto-calculate juz from surah/ayah

---

### 3.2 Fasting Calendar

Kalender visual 30 hari untuk tracking puasa.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  FASTING CALENDAR                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Puasa Ramadan                                    Streak: 12 hari           │
│                                                                             │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐           │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │10 │11 │12 │13 │14 │15 │           │
│  │ V │ V │ V │ V │ V │ V │ V │ V │ V │ V │ V │ V │ - │ - │ - │           │
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘           │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐           │
│  │16 │17 │18 │19 │20 │21 │22 │23 │24 │25 │26 │27 │28 │29 │30 │           │
│  │ - │ - │ - │ - │ - │ - │ - │ - │ - │ - │ - │ - │ - │ - │ - │           │
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘           │
│                                                                             │
│  Legend: V = Full  U = Udzur  X = Skip  - = Pending                        │
│                                                                             │
│  [Tandai Hari Ini]                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Files:**
- `src/components/tracker/FastingCalendar.tsx` - Main calendar grid
- `src/components/tracker/FastingDayCell.tsx` - Individual day cell
- `src/components/tracker/FastingStatusModal.tsx` - Modal untuk pilih status

**Features:**
- 30-day grid visual
- 4 status: Full (hijau), Udzur (kuning), Skip (merah), Pending (abu)
- Streak counter
- Tap to toggle status
- Notes per day (optional)
- Gentle messaging (no judgment)

---

### 3.3 Tarawih Tracker

Card untuk tracking sholat tarawih & witir.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARAWIH TRACKER                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tarawih Malam Ini                                       Malam ke-12        │
│                                                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐                    │
│  │  Moon Icon             │  │  Moon Icon             │                    │
│  │                        │  │                        │                    │
│  │  Tarawih               │  │  Witir                 │                    │
│  │  [ ] 8 rakaat          │  │  [ ] 3 rakaat          │                    │
│  │  [ ] 11 rakaat         │  │  [ ] 1 rakaat          │                    │
│  │  [ ] 23 rakaat         │  │                        │                    │
│  └────────────────────────┘  └────────────────────────┘                    │
│                                                                             │
│  Masjid (opsional): ____________________________________                    │
│                                                                             │
│  Progress: ████████████░░░░░░░ 12/30 malam                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**File:** `src/components/tracker/TarawihCard.tsx`

**Features:**
- Toggle tarawih (8/11/23 rakaat options)
- Toggle witir (1/3 rakaat)
- Optional mosque name
- Monthly progress bar (0-30)
- Haptic feedback on toggle

---

### 3.4 Sedekah Log

Card sederhana untuk tracking sedekah harian.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  SEDEKAH LOG                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Sedekah Ramadan                                                            │
│                                                                             │
│  Total: 15 kali            Streak: 5 hari berturut                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  Hari ini sudah sedekah?                                            │   │
│  │                                                                      │   │
│  │        [   Sudah V   ]    [   Belum   ]                             │   │
│  │                                                                      │   │
│  │  Catatan (opsional): ________________________________               │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  HandHeart Icon "Sedekah tidak mengurangi harta" - HR. Muslim               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**File:** `src/components/tracker/SedekahCard.tsx`

**Features:**
- Simple toggle (sudah/belum)
- Total count (sepanjang Ramadan)
- Streak counter
- Optional notes (no nominal required - no judgment)
- Random hadits motivasi tentang sedekah

---

### 3.5 Ramadan Goals

Progress tracker untuk target Ramadan personal.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  RAMADAN GOALS                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Target Ramadanku                                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  V  Khatam Al-Quran 1x                    ████████░░░ 80%           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  -  Sedekah setiap hari                   ██████░░░░░ 60%           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  -  Tarawih 30 malam penuh                ████░░░░░░░ 40%           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  V  Puasa full 30 hari                    ████████████ 100%         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [+ Tambah Target Baru]                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Files:**
- `src/components/dashboard/RamadanGoalsCard.tsx` - Summary card for dashboard
- `src/pages/GoalsPage.tsx` - Full page for managing goals

**Features:**
- Preset goals (Khatam 1x, Fasting 30, Tarawih 30, Sedekah 30)
- Custom goals (user-defined)
- Auto-calculate progress from other trackers
- Visual progress bars
- Celebration animation when goal completed
- Icons per goal type

---

## Part 4: Weekly Share Card Generator

Upgrade `share-card.ts` untuk weekly summary.

```text
┌───────────────────────────────────────────┐
│                                           │
│        Moon Icon  RAMADAN WEEK 2          │
│                                           │
│     CheckCircle Puasa: 14/14 hari         │
│     CheckCircle Sholat: 70/70 waktu       │
│     BookOpen Quran: Juz 10                │
│     HandHeart Sedekah: 12 kali            │
│     Moon Tarawih: 14/14 malam             │
│                                           │
│        Flame Streak: 14 hari              │
│                                           │
│        #MyRamadhan                        │
│                                           │
└───────────────────────────────────────────┘
1080x1920 (IG Story format)
```

**File:** `src/lib/share-card.ts` (extend existing)

**Features:**
- Week number detection (1-4)
- Auto-collect stats from all trackers
- Beautiful gradient background
- Canvas-generated image
- Web Share API + download fallback
- 1080x1920 format (IG Story ready)
- No numerical percentages (maintain "no judgment" philosophy)

---

## Part 5: Additional Features (Bonus)

### 5.1 Lailatul Qadr Tracker

Special tracker untuk 10 malam terakhir.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAILATUL QADR NIGHTS                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  10 Malam Terakhir                                        Malam ke-25       │
│                                                                             │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐            │
│  │ 21  │ 22  │ 23  │ 24  │ 25  │ 26  │ 27  │ 28  │ 29  │ 30  │            │
│  │ V   │ V   │ V   │ V   │ ->  │ -   │ -   │ -   │ -   │ -   │            │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘            │
│                                                                             │
│  Ibadah malam ini:                                                          │
│  [V] Qiyamul Lail    [V] Baca Quran    [ ] I'tikaf                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**File:** `src/components/tracker/LailatulQadrCard.tsx`

**Features:**
- 10-day visual grid (21-30)
- Special ibadah checklist (Qiyamul Lail, Quran, I'tikaf)
- Only shows during last 10 days
- Glow effect on odd nights (21, 23, 25, 27, 29)

---

### 5.2 Sholat Sunnah Tracker

Track sholat-sholat sunnah Ramadan.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  SHOLAT SUNNAH                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ] Tahajjud         2-8 rakaat                                            │
│  [ ] Dhuha            2-12 rakaat                                           │
│  [V] Rawatib Subuh    2 rakaat                                              │
│  [V] Rawatib Dzuhur   4 rakaat                                              │
│  [ ] Rawatib Ashar    4 rakaat                                              │
│  [V] Rawatib Maghrib  2 rakaat                                              │
│  [V] Rawatib Isya     2 rakaat                                              │
│                                                                             │
│  Progress: 4/7 hari ini                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**File:** `src/components/tracker/SunnahPrayerCard.tsx`

---

### 5.3 Ramadan Statistics Page

Full page untuk melihat semua statistik Ramadan.

**File:** `src/pages/StatsPage.tsx`

**Content:**
- Overview cards (Fasting, Tarawih, Quran, Sedekah)
- Weekly trend charts (using recharts - already installed)
- Best streak records
- Goal completion status
- Daily activity heatmap

---

## Part 6: Implementation Phases

### Phase 1: Database Setup (1-2 jam)
- Create migration with all new tables
- Add RLS policies and triggers
- Test CRUD operations

### Phase 2: Hooks Layer (3-4 jam)
- Create all Supabase hooks
- Add React Query integration
- Implement optimistic updates

### Phase 3: Tracker Components (4-5 jam)
- FastingCalendar
- TarawihCard
- SedekahCard
- Quran Progress Card
- RamadanGoalsCard

### Phase 4: Page Updates (2-3 jam)
- Update TrackerPage with new components
- Update DashboardPage with new cards
- Create GoalsPage

### Phase 5: Share Card & Polish (2-3 jam)
- Weekly share card generator
- Celebration animations
- Loading states
- Error handling

### Phase 6: Bonus Features (3-4 jam)
- Lailatul Qadr tracker
- Sunnah prayer tracker
- Statistics page

**Total Estimated: 15-21 jam**

---

## Part 7: Files Summary

### New Files to Create

```text
src/hooks/
├── useProfile.ts
├── useFastingLog.ts
├── useTarawihLog.ts
├── useSedekahLog.ts
├── useRamadanGoals.ts
├── useDailyStatus.ts
├── useReflections.ts
├── useReadingProgress.ts
├── useDhikrSessions.ts
└── useDailyTracker.ts

src/components/dashboard/
├── QuranProgressCard.tsx
└── RamadanGoalsCard.tsx

src/components/tracker/
├── FastingCalendar.tsx
├── FastingDayCell.tsx
├── FastingStatusModal.tsx
├── TarawihCard.tsx
├── SedekahCard.tsx
├── LailatulQadrCard.tsx
└── SunnahPrayerCard.tsx

src/pages/
├── GoalsPage.tsx
└── StatsPage.tsx
```

### Files to Modify

```text
src/pages/DashboardPage.tsx     - Add new cards
src/pages/TrackerPage.tsx       - Add tracker components
src/lib/share-card.ts           - Add weekly summary
src/App.tsx                     - Add new routes
src/components/layout/Sidebar.tsx - Add new nav items
```

---

## Part 8: TypeScript Types

```typescript
// Types for new tables
interface FastingLog {
  id: string;
  user_id: string;
  date: string;
  status: 'full' | 'udzur' | 'skip' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface TarawihLog {
  id: string;
  user_id: string;
  date: string;
  tarawih_done: boolean;
  rakaat_count: number;
  witir_done: boolean;
  witir_rakaat: number;
  mosque_name?: string;
  created_at: string;
  updated_at: string;
}

interface SedekahLog {
  id: string;
  user_id: string;
  date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface RamadanGoal {
  id: string;
  user_id: string;
  goal_type: 'khatam' | 'fasting_30' | 'tarawih_30' | 'sedekah_30' | 'custom';
  title: string;
  target: number;
  current: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Checklist

| Task | Status |
|------|--------|
| Database migration (6 tables) | Pending |
| RLS policies & triggers | Pending |
| useProfile hook | Pending |
| useFastingLog hook | Pending |
| useTarawihLog hook | Pending |
| useSedekahLog hook | Pending |
| useRamadanGoals hook | Pending |
| useDailyStatus hook | Pending |
| useReflections hook | Pending |
| useReadingProgress hook | Pending |
| useDhikrSessions hook | Pending |
| useDailyTracker hook | Pending |
| QuranProgressCard | Pending |
| FastingCalendar | Pending |
| TarawihCard | Pending |
| SedekahCard | Pending |
| RamadanGoalsCard | Pending |
| GoalsPage | Pending |
| Weekly share card | Pending |
| LailatulQadrCard (bonus) | Pending |
| SunnahPrayerCard (bonus) | Pending |
| StatsPage (bonus) | Pending |
