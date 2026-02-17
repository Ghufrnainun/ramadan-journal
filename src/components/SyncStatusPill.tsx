import { Cloud, CloudOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { scheduleSyncQueueDrain } from '@/lib/offline-sync';

const SyncStatusPill = () => {
  const { pending, failed, maxRetryReached, isOnline } = useSyncStatus();

  const hasSyncWork = pending > 0 || failed > 0;
  if (!hasSyncWork && isOnline) return null;

  const label = !isOnline
    ? 'Offline mode'
    : maxRetryReached > 0
      ? `Sync blocked (${maxRetryReached})`
      : failed > 0
        ? `Sync retrying (${failed})`
        : `Sync pending (${pending})`;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur">
        {!isOnline ? (
          <CloudOff className="h-3.5 w-3.5 text-amber-300" />
        ) : maxRetryReached > 0 ? (
          <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
        ) : failed > 0 ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-300" />
        ) : (
          <Cloud className="h-3.5 w-3.5 text-emerald-300" />
        )}
        <span>{label}</span>
        {isOnline && hasSyncWork && (
          <button
            type="button"
            onClick={() => scheduleSyncQueueDrain(10)}
            className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] text-slate-200 hover:bg-slate-800"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default SyncStatusPill;
