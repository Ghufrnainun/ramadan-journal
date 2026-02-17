import { supabase } from '@/integrations/supabase/runtime-client';
import { getProfile } from '@/lib/storage';
import { getRamadanInfo } from '@/lib/ramadan-dates';
import { getStreakSummary } from '@/lib/streak';
import { getLocalDateKey } from '@/lib/date';

interface ShareCardOptions {
  title: string;
  subtitle?: string;
  body: string;
  footer?: string;
}

export interface WeeklySummaryStats {
  weekNumber: number;
  fastingDays: number;
  tarawihNights: number;
  sedekahCount: number;
  quranJuz: number;
  streakDays: number;
}

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);
  return lines;
};

const drawGradientBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#020617');
  gradient.addColorStop(0.5, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
  ctx.beginPath();
  ctx.arc(width * 0.82, 220, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
  ctx.beginPath();
  ctx.arc(width * 0.2, height - 180, 220, 0, Math.PI * 2);
  ctx.fill();
};

export const generateShareCard = async (
  options: ShareCardOptions,
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  drawGradientBackground(ctx, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 48px "Playfair Display", serif';
  ctx.fillText(options.title, 80, 170);

  if (options.subtitle) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(options.subtitle, 80, 220);
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '32px "Plus Jakarta Sans", sans-serif';
  const lines = wrapText(ctx, options.body, 900);
  let y = 320;
  lines.slice(0, 12).forEach((line) => {
    ctx.fillText(line, 80, y);
    y += 48;
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(options.footer || 'MyRamadhanku', 80, 1230);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image'));
        } else {
          resolve(blob);
        }
      },
      'image/png',
    );
  });
};

export const getWeeklySummaryStats = async (): Promise<WeeklySummaryStats> => {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  const start = getLocalDateKey(weekStart);
  const end = getLocalDateKey(now);

  const [fastingRes, tarawihRes, sedekahRes, readingRes] = await Promise.all([
    supabase
      .from('fasting_log')
      .select('date,status')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end),
    supabase
      .from('tarawih_log')
      .select('date,tarawih_done')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end),
    supabase
      .from('sedekah_log')
      .select('date,completed')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end),
    supabase
      .from('reading_progress')
      .select('juz_number')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (fastingRes.error) throw fastingRes.error;
  if (tarawihRes.error) throw tarawihRes.error;
  if (sedekahRes.error) throw sedekahRes.error;
  if (readingRes.error) throw readingRes.error;

  const profile = getProfile();
  const ramadanInfo = getRamadanInfo();
  const ramadanStart =
    profile.ramadanStartDate ??
    (ramadanInfo.nextRamadan ? getLocalDateKey(ramadanInfo.nextRamadan.start) : undefined) ??
    getLocalDateKey(now);
  const diffDay = Math.max(
    0,
    Math.floor(
      (now.getTime() - new Date(ramadanStart).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
  const weekNumber = Math.max(1, Math.min(4, Math.floor(diffDay / 7) + 1));

  const streak = getStreakSummary(profile.ramadanStartDate);

  return {
    weekNumber,
    fastingDays: (fastingRes.data ?? []).filter((log) => log.status === 'full').length,
    tarawihNights: (tarawihRes.data ?? []).filter((log) => log.tarawih_done).length,
    sedekahCount: (sedekahRes.data ?? []).filter((log) => log.completed).length,
    quranJuz: readingRes.data?.juz_number ?? 0,
    streakDays: streak.currentActiveStreak,
  };
};

export const generateWeeklySummaryCard = async (
  stats: WeeklySummaryStats,
  lang: 'id' | 'en',
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  drawGradientBackground(ctx, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.lineWidth = 5;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 62px "Playfair Display", serif';
  ctx.fillText(lang === 'id' ? `RAMADAN PEKAN ${stats.weekNumber}` : `RAMADAN WEEK ${stats.weekNumber}`, 110, 220);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MyRamadhanku Summary', 110, 280);

  const lines = [
    lang === 'id' ? `Puasa: ${stats.fastingDays}/7 hari` : `Fasting: ${stats.fastingDays}/7 days`,
    lang === 'id'
      ? `Tarawih: ${stats.tarawihNights}/7 malam`
      : `Tarawih: ${stats.tarawihNights}/7 nights`,
    lang === 'id'
      ? `Sedekah: ${stats.sedekahCount} kali`
      : `Sedekah: ${stats.sedekahCount} times`,
    lang === 'id' ? `Quran: Juz ${stats.quranJuz}` : `Quran: Juz ${stats.quranJuz}`,
    lang === 'id' ? `Streak: ${stats.streakDays} hari` : `Streak: ${stats.streakDays} days`,
  ];

  let y = 480;
  lines.forEach((line) => {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(line, 110, y);
    y += 160;
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('#MyRamadhan', 110, 1760);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to create image'));
        else resolve(blob);
      },
      'image/png',
    );
  });
};

export interface DailyProgressStats {
  ramadanDay: number;
  totalFasting: number;
  totalTarawih: number;
  totalSedekah: number;
  quranJuz: number;
  streakDays: number;
}

export const getDailyProgressStats = async (): Promise<DailyProgressStats> => {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) throw new Error('Not authenticated');

  const profile = getProfile();
  const ramadanInfo = getRamadanInfo();
  const ramadanStart =
    profile.ramadanStartDate ??
    (ramadanInfo.nextRamadan ? getLocalDateKey(ramadanInfo.nextRamadan.start) : undefined) ??
    getLocalDateKey(new Date());

  const now = new Date();
  const ramadanDay = Math.max(
    1,
    Math.floor((now.getTime() - new Date(ramadanStart).getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  const [fastingRes, tarawihRes, sedekahRes, readingRes] = await Promise.all([
    supabase.from('fasting_log').select('status').eq('user_id', user.id),
    supabase.from('tarawih_log').select('tarawih_done').eq('user_id', user.id),
    supabase.from('sedekah_log').select('completed').eq('user_id', user.id),
    supabase
      .from('reading_progress')
      .select('juz_number')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const streak = getStreakSummary(profile.ramadanStartDate);

  return {
    ramadanDay,
    totalFasting: (fastingRes.data ?? []).filter((l) => l.status === 'full').length,
    totalTarawih: (tarawihRes.data ?? []).filter((l) => l.tarawih_done).length,
    totalSedekah: (sedekahRes.data ?? []).filter((l) => l.completed).length,
    quranJuz: readingRes.data?.juz_number ?? 0,
    streakDays: streak.currentActiveStreak,
  };
};

export const generateDailyProgressCard = async (
  stats: DailyProgressStats,
  lang: 'id' | 'en',
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  drawGradientBackground(ctx, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.lineWidth = 5;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Title
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 72px "Playfair Display", serif';
  const title =
    lang === 'id' ? `HARI KE-${stats.ramadanDay}` : `DAY ${stats.ramadanDay}`;
  ctx.fillText(title, 110, 260);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 48px "Playfair Display", serif';
  ctx.fillText('RAMADAN', 110, 340);

  // Stats
  const items = [
    {
      emoji: '🌙',
      label: lang === 'id' ? 'Puasa' : 'Fasting',
      value: `${stats.totalFasting} ${lang === 'id' ? 'hari' : 'days'}`,
    },
    {
      emoji: '🕌',
      label: 'Tarawih',
      value: `${stats.totalTarawih} ${lang === 'id' ? 'malam' : 'nights'}`,
    },
    {
      emoji: '💝',
      label: lang === 'id' ? 'Sedekah' : 'Charity',
      value: `${stats.totalSedekah} ${lang === 'id' ? 'kali' : 'times'}`,
    },
    {
      emoji: '📖',
      label: 'Quran',
      value: `Juz ${stats.quranJuz}`,
    },
    {
      emoji: '🔥',
      label: 'Streak',
      value: `${stats.streakDays} ${lang === 'id' ? 'hari' : 'days'}`,
    },
  ];

  let y = 560;
  items.forEach((item) => {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${item.emoji}  ${item.label}`, 110, y);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(item.value, 110, y + 70);

    y += 200;
  });

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('#MyRamadhan  •  MyRamadhanku', 110, 1760);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to create image'));
        else resolve(blob);
      },
      'image/png',
    );
  });
};

export const shareImage = async (blob: Blob, fallbackName: string) => {
  const file = new File([blob], fallbackName, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'MyRamadhanku' });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackName;
  link.click();
  URL.revokeObjectURL(url);
};
