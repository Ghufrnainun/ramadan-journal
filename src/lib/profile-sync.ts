import { supabase } from "@/integrations/supabase/client";
import { getProfile, saveProfile, UserProfile } from "@/lib/storage";
import { Database } from "@/integrations/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"] & {
  ramadan_end_date?: string | null;
  silent_mode?: boolean | null;
  hide_streak?: boolean | null;
};

const mapProfileToDb = (profile: UserProfile) => ({
  language: profile.language,
  city: profile.location?.city || null,
  province: profile.location?.province || null,
  ramadan_start_date: profile.ramadanStartDate || null,
  ramadan_end_date: profile.ramadanEndDate || null,
  focus_modules: profile.focusModules,
  reminders_sahur: profile.reminders.sahur,
  reminders_iftar: profile.reminders.iftar,
  reminders_prayer: profile.reminders.prayer,
  reminders_reflection: profile.reminders.reflection,
  onboarding_completed: profile.onboardingCompleted,
  display_name: profile.displayName || null,
  silent_mode: profile.silentMode,
  hide_streak: profile.hideStreak || false,
});

const mapDbToProfile = (row: ProfileRow): Partial<UserProfile> => ({
  language: (row.language === "en" ? "en" : "id") as "en" | "id",
  location:
    row.city && row.province
      ? { city: row.city, province: row.province }
      : null,
  ramadanStartDate: row.ramadan_start_date || null,
  ramadanEndDate: row.ramadan_end_date || null,
  focusModules: row.focus_modules || [
    "prayer",
    "quran",
    "dhikr",
    "tracker",
    "reflection",
  ],
  reminders: {
    sahur: !!row.reminders_sahur,
    iftar: !!row.reminders_iftar,
    prayer: !!row.reminders_prayer,
    reflection: !!row.reminders_reflection,
  },
  onboardingCompleted: !!row.onboarding_completed,
  displayName: row.display_name || null,
  silentMode: !!row.silent_mode,
  hideStreak: !!row.hide_streak,
});

export const syncProfileOnLogin = async (userId: string) => {
  const local = getProfile();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error);
    return;
  }

  if (!data) {
    await supabase
      .from("profiles")
      .update(mapProfileToDb(local))
      .eq("user_id", userId);
    return;
  }

  saveProfile(mapDbToProfile(data));
};

export const saveProfileAndSync = async (
  updates: Partial<UserProfile>,
  userId?: string | null,
) => {
  saveProfile(updates);
  if (!userId) return;
  const profile = getProfile();
  const { error } = await supabase
    .from("profiles")
    .update(mapProfileToDb(profile))
    .eq("user_id", userId);
  if (error) {
    console.error("Failed to sync profile:", error);
  }
};
