import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { equranApi } from "@/lib/api/equran";
import { getLocalDateKey } from "@/lib/date";
import {
  getPrayerTimesFromApi,
  PrayerTimes,
  getCityMapping,
} from "@/lib/prayer-times";

interface RemindersBannerProps {
  lang: "id" | "en";
  location: { city: string; province: string } | null;
  ramadanStartDate: string | null;
  ramadanEndDate?: string | null;
  reminders: {
    sahur: boolean;
    iftar: boolean;
    prayer: boolean;
    reflection: boolean;
  };
  silentMode: boolean;
}

interface ReminderCandidate {
  id: string;
  label: string;
  time: string;
  minutesLeft: number;
}

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const getMinutesLeft = (targetTime: string): number => {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  let target = timeToMinutes(targetTime);
  if (target < current) target += 24 * 60;
  return target - current;
};

const isInRamadan = (
  ramadanStartDate: string | null,
  ramadanEndDate?: string | null,
) => {
  if (!ramadanStartDate) return false;
  const now = new Date();
  const start = new Date(ramadanStartDate);
  const end = ramadanEndDate ? new Date(ramadanEndDate) : new Date(start);
  if (!ramadanEndDate) {
    end.setDate(end.getDate() + 30);
  }
  return now >= start && now <= end;
};

const RemindersBanner: React.FC<RemindersBannerProps> = ({
  lang,
  location,
  ramadanStartDate,
  ramadanEndDate,
  reminders,
  silentMode,
}) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [imsakTime, setImsakTime] = useState<string | null>(null);
  const [iftarTime, setIftarTime] = useState<string | null>(null);
  const [nextReminder, setNextReminder] = useState<ReminderCandidate | null>(
    null,
  );

  const hasReminders = useMemo(
    () => Object.values(reminders).some(Boolean) && !silentMode,
    [reminders, silentMode],
  );

  useEffect(() => {
    if (!location || !hasReminders) return;
    let isMounted = true;
    const loadTimes = async () => {
      try {
        const times = await getPrayerTimesFromApi(location.city);
        if (isMounted) setPrayerTimes(times);
      } catch (e) {
        console.error("Failed to load prayer times for reminders", e);
      }

      if (reminders.sahur || reminders.iftar) {
        try {
          const year = new Date().getFullYear();
          const mapping = getCityMapping(location.city);
          const schedule = await equranApi.getJadwalImsakiyah(
            mapping.provinsi,
            mapping.kabkota,
            year,
          );
          const todayStr = getLocalDateKey();
          const today = schedule.find((item) => item.tanggal === todayStr);
          if (today && isMounted) {
            setImsakTime(today.imsak);
            setIftarTime(today.maghrib);
          }
        } catch (e) {
          console.error("Failed to load imsakiyah for reminders", e);
        }
      }
    };

    loadTimes();
    return () => {
      isMounted = false;
    };
  }, [location, reminders, hasReminders]);

  useEffect(() => {
    if (!hasReminders) return;
    const tick = () => {
      const candidates: ReminderCandidate[] = [];
      const addCandidate = (
        id: string,
        label: string,
        time?: string | null,
      ) => {
        if (!time) return;
        candidates.push({
          id,
          label,
          time,
          minutesLeft: getMinutesLeft(time),
        });
      };

      if (reminders.prayer && prayerTimes) {
        addCandidate(
          "subuh",
          lang === "id" ? "Subuh" : "Fajr",
          prayerTimes.subuh,
        );
        addCandidate(
          "dzuhur",
          lang === "id" ? "Dzuhur" : "Dhuhr",
          prayerTimes.dzuhur,
        );
        addCandidate(
          "ashar",
          lang === "id" ? "Ashar" : "Asr",
          prayerTimes.ashar,
        );
        addCandidate(
          "maghrib",
          lang === "id" ? "Maghrib" : "Maghrib",
          prayerTimes.maghrib,
        );
        addCandidate("isya", lang === "id" ? "Isya" : "Isha", prayerTimes.isya);
      }

      if (isInRamadan(ramadanStartDate, ramadanEndDate)) {
        if (reminders.sahur)
          addCandidate("imsak", lang === "id" ? "Imsak" : "Imsak", imsakTime);
        if (reminders.iftar)
          addCandidate("iftar", lang === "id" ? "Berbuka" : "Iftar", iftarTime);
      }

      if (reminders.reflection && prayerTimes?.isya) {
        const isyaMinutes = timeToMinutes(prayerTimes.isya) + 30;
        const h = Math.floor(isyaMinutes / 60) % 24;
        const m = isyaMinutes % 60;
        addCandidate(
          "reflection",
          lang === "id" ? "Refleksi Malam" : "Night Reflection",
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        );
      }

      const upcoming = candidates
        .filter((c) => c.minutesLeft >= 0)
        .sort((a, b) => a.minutesLeft - b.minutesLeft)[0];

      if (upcoming && upcoming.minutesLeft <= 60) {
        setNextReminder(upcoming);
      } else {
        setNextReminder(null);
      }

      if (upcoming && upcoming.minutesLeft <= 5 && "Notification" in window) {
        const key = `myramadhanku_notified_${upcoming.id}_${upcoming.time}`;
        if (
          !localStorage.getItem(key) &&
          Notification.permission === "granted" &&
          !silentMode
        ) {
          const body =
            lang === "id"
              ? `${upcoming.label} dalam ${upcoming.minutesLeft} menit`
              : `${upcoming.label} in ${upcoming.minutesLeft} minutes`;
          new Notification("MyRamadhanku", { body });
          localStorage.setItem(key, "1");
        }
      }
    };

    tick();
    const interval = setInterval(tick, 60 * 1000);
    return () => clearInterval(interval);
  }, [
    hasReminders,
    reminders,
    prayerTimes,
    imsakTime,
    iftarTime,
    ramadanStartDate,
    ramadanEndDate,
    lang,
    silentMode,
  ]);

  if (!nextReminder) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
        <Bell className="w-5 h-5 text-amber-300" />
      </div>
      <div>
        <p className="text-sm text-white font-medium">{nextReminder.label}</p>
        <p className="text-xs text-amber-200/80">
          {lang === "id" ? "Mulai dalam" : "Starts in"}{" "}
          {nextReminder.minutesLeft} {lang === "id" ? "menit" : "minutes"}
        </p>
      </div>
    </div>
  );
};

export default RemindersBanner;
