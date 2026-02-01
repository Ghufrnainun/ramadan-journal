

# MyRamadhanku — Complete Build Plan

## Overview
A calm, premium Ramadan companion PWA with a cinematic marketing landing page, bilingual support (ID/EN), and a full-featured spiritual tracking dashboard. Built with React + Vite + Tailwind + your Supabase backend.

---

## Phase 1: Cinematic Landing Page + Foundation
**The premium "night Ramadan journal" landing experience**

### Design System
- **Color palette**: Deep navy/charcoal (#0f172a, #1e293b) + warm gold (#d4a574) + olive accents
- **Typography**: Serif accent (for headings/quotes) + clean sans-serif (body)
- **Motion**: Subtle, calming animations throughout

### Landing Page Structure (10+ sections)
1. **Hero** — Full-screen cinematic with animated hanging lanterns (SVG + CSS keyframes), twinkling stars, slow gradient drift. Countdown chip showing "Ramadan starts in X days"
2. **"Tonight focus" whisper** — Journal-tone editorial line
3. **Problem vignette** — 3 gentle pain points (confusion, dropping off, noisy apps)
4. **Promise statement** — "Your calm companion, no judgement"
5. **Product preview gallery** — 4 UI mockup cards (countdown, quote, checklist, dhikr)
6. **Daily flow timeline** — Pagi → Siang → Maghrib → Malam visual journey
7. **Feature stories** — 6 alternating left/right blocks with mini UI snippets
8. **Gentle streak explanation** — Ramadan-only, hideable, no shame messaging
9. **Reminders philosophy** — OFF by default, silent mode, honest limitations
10. **Privacy & trust** — Guest mode, optional sync, no ads, no data selling
11. **FAQ accordion** — 7 common questions
12. **Final CTA + footer** — "Mulai Sekarang" prominent

### Interactive Elements
- Sticky mobile bottom CTA (appears after scroll > 420px)
- Language toggle (ID/EN) in navigation
- Smooth scroll navigation
- Lantern swing + glow animation
- Content reveal animations on scroll

---

## Phase 2: Core Infrastructure
**Bilingual system, auth, and data layer**

### i18n (Bilingual ID + EN)
- Translation dictionaries: `/src/i18n/id.ts` and `/src/i18n/en.ts`
- Lightweight hook-based translation system (no heavy libs)
- Language stored in localStorage (guest) or profiles table (logged in)
- Toggle in Settings with instant UI update

### Supabase Integration
- Connect your Supabase project
- Auth with email/password
- Clean auth pages matching the calm design

### Database Schema
**Tables:**
- `profiles` — user settings, location, Ramadan dates, language preference
- `daily_status` — date, intention, mood, notes
- `checklist_items` — default + custom items per user
- `daily_checklist` — completion status per item per day
- `reading_progress` — Quran tracking (surah, ayah, page, target)
- `dhikr_presets` — static presets (seeded)
- `dhikr_sessions` — user counts per day per dhikr
- `reflections` — nightly reflections with draft support
- `quotes` — daily quotes (seeded, bilingual)
- `bookmarks` — saved ayahs, quotes, dhikr

**RLS Policies:**
- All user tables: `user_id = auth.uid()`
- Public tables (quotes, presets): read-only for all

### Guest Mode Architecture
- IndexedDB for local storage
- Same data structure as Supabase tables
- "Merge on login" flow with user prompt

---

## Phase 3: Onboarding Flow
**5-step welcoming experience**

1. **Welcome** — Calm, warm greeting (no pressure)
2. **Location** — Auto-detect + manual city selector for Indonesia
3. **Calendar** — Set Ramadan start date (Sidang Isbat override)
4. **Focus picker** — Choose which modules appear on dashboard
5. **Reminders** — All OFF by default, gentle opt-in

Saves to profile (logged in) or localStorage (guest)

---

## Phase 4: Dashboard & Core Features
**The daily companion experience**

### Dashboard Layout
- **Countdown/Day display** — "Ramadan Day X" or countdown to start/Eid
- **Quote of the day** — Bilingual, contextual
- **Prayer times** — Imsak, Subuh, Dzuhur, Ashar, Maghrib, Isya
- **Quick actions** — Navigate to Tracker, Dhikr, Quran
- **Today's intention** — Editable daily intention
- **Mood tracker** — Simple 😌 😐 😫 selector

### Prayer Times
- Fetch from lightweight API (cached in DB or localStorage)
- Location-based for Indonesian cities
- Graceful fallback with retry on failure

### Daily Tracker (Checklist)
- Default 5 items: Shalat tepat waktu, Tadarus, Dzikir, Sedekah, Menjaga lisan
- Visual progress (no percentages/scores)
- Optional notes per item
- Daily reset

### Dhikr Counter
- Big tap area for easy counting
- Preset dhikr (SubhanAllah, Alhamdulillah, etc.)
- Custom dhikr creation
- Daily session tracking with reset
- Works offline, syncs when connected

### Quran/Tadarus Progress
- Static JSON dataset (Arabic + translation)
- Lazy-loaded reader component
- Track: last surah/ayah/page
- Daily target (default 1 juz)
- Simple "Tadarus mode" progress indicator

---

## Phase 5: Mindful Features
**Reflection and gentle accountability**

### Daily Reflection
- Prompted after Isya
- One journaling prompt per day
- Auto-save drafts
- Privacy-first (only user can see)

### Gentle Streak
- Ramadan-only (max 30 days)
- Two types: active days, reflection days
- No "streak lost" messaging
- Toggle to hide completely

### Bookmarks
- Save: ayahs, quotes, dhikr
- Unified bookmarks page
- Stored as JSON payloads

---

## Phase 6: Sharing & Social
**Spread positivity without pressure**

### Share Reflection Card
- Client-side canvas image generation
- Shows: Ramadan Day X, reflection/quote, optional checkmarks
- Web Share API with image download fallback
- Beautiful, shareable design

---

## Phase 7: Settings & Polish

### Settings Page
- Language toggle (ID/EN)
- Location management
- Ramadan/Eid date override
- Notification preferences
- Silent mode toggle
- Profile management
- Logout

### Reminders (Gentle)
- In-app reminder surfaces (banners, schedule)
- Browser notifications (when app open + permission granted)
- Clear UI explanation of limitations (especially iOS)
- Types: countdown reminders, prayer times, habits, reflection

---

## Phase 8: PWA & Offline

### PWA Setup
- Manifest with proper icons
- App name: "MyRamadhanku"
- Installable on mobile

### Offline Support
- Service worker caching
- Static JSON datasets cached
- Offline fallback page
- Sync queue for offline actions

---

## Design Highlights Throughout
- **Night Ramadan vibe**: Dark backgrounds, warm gold accents
- **Calming motion**: Subtle fades, no jarring animations
- **Mobile-first**: Optimized for low-end Android phones
- **Bottom navigation**: Dashboard, Quran, Dhikr, Tracker, More
- **Lightweight**: No videos, minimal images, SVG icons only
- **Accessible**: Clear contrast, readable fonts

---

## What We'll Deliver
✅ Full cinematic landing page with lantern animations  
✅ Complete bilingual system (ID + EN)  
✅ Supabase auth + database with RLS  
✅ Guest mode with merge-on-login  
✅ 5-step onboarding  
✅ Dashboard with countdown, prayer times, quote  
✅ Daily tracker with checklist  
✅ Dhikr counter with presets  
✅ Quran reading progress  
✅ Reflection journal  
✅ Gentle streak system  
✅ Bookmarks  
✅ Share card generator  
✅ PWA with offline support  
✅ Settings with all user preferences

