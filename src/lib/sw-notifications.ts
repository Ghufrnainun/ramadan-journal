/**
 * Helper to send reminder schedules to the Service Worker.
 */

export interface SWReminder {
  id: string;
  body: string;
  minutesLeft: number;
}

let swRegistration: ServiceWorkerRegistration | null = null;

export const ensureSWRegistered = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  if (swRegistration) return swRegistration;
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js');
    return swRegistration;
  } catch (e) {
    console.error('SW registration failed', e);
    return null;
  }
};

export const sendRemindersToSW = async (reminders: SWReminder[]) => {
  const reg = await ensureSWRegistered();
  const sw = reg?.active || reg?.installing || reg?.waiting;
  if (!sw) return;
  sw.postMessage({ type: 'SCHEDULE_REMINDERS', reminders });
};
