import { supabase } from '@/integrations/supabase/runtime-client';

type SyncOperation = 'insert' | 'upsert' | 'update' | 'delete';

export interface QueuedMutation {
  id: string;
  userId: string;
  table: string;
  operation: SyncOperation;
  payload?: Record<string, unknown>;
  match?: Record<string, unknown>;
  onConflict?: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  dedupeKey: string;
}

interface QueueMutationInput {
  userId: string;
  table: string;
  operation: SyncOperation;
  payload?: Record<string, unknown>;
  match?: Record<string, unknown>;
  onConflict?: string;
  lastError?: string;
}

export interface SyncQueueStats {
  total: number;
  pending: number;
  failed: number;
  maxRetryReached: number;
  isOnline: boolean;
}

const CACHE_PREFIX = 'myramadhanku_cache';
const QUEUE_KEY = 'myramadhanku_sync_queue';
const MAX_RETRY = 8;
const MAX_QUEUE_ITEMS = 500;
const SYNC_EVENT = 'myramadhanku:sync-queue-changed';

let drainInFlight = false;
let drainTimer: ReturnType<typeof setTimeout> | null = null;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const stableStringify = (value: unknown): string => {
  if (!isObject(value)) return JSON.stringify(value);
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    sorted[key] = value[key];
  }
  return JSON.stringify(sorted);
};

const buildDedupeKey = (input: QueueMutationInput): string => {
  const match = stableStringify(input.match ?? {});
  const onConflict = input.onConflict ?? '';
  let identity = '';

  if (input.operation === 'upsert') {
    const payload = input.payload ?? {};
    const conflictColumns = onConflict
      .split(',')
      .map((column) => column.trim())
      .filter(Boolean);
    const conflictValues = conflictColumns.map((column) => ({
      column,
      value: payload[column],
    }));
    identity = `${onConflict}|${stableStringify(conflictValues)}|${match}`;
  } else if (input.operation === 'update') {
    identity = `${onConflict}|${match}`;
  } else if (input.operation === 'delete') {
    identity = match;
  } else {
    const payload = input.payload ?? {};
    if (typeof payload.id === 'string') {
      identity = `id:${payload.id}`;
    } else {
      identity = stableStringify(payload);
    }
  }

  return `${input.userId}|${input.table}|${input.operation}|${identity}`;
};

const emitQueueChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SYNC_EVENT));
};

export const getScopedCacheKey = (resource: string, userId?: string | null) =>
  `${CACHE_PREFIX}:${userId ?? 'guest'}:${resource}`;

export const readOfflineCache = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeOfflineCache = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors.
  }
};

export const getSyncQueueSnapshot = (): QueuedMutation[] => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as QueuedMutation[]) : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue: QueuedMutation[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore storage quota errors.
  } finally {
    emitQueueChanged();
  }
};

const compactQueue = (queue: QueuedMutation[]): QueuedMutation[] => {
  const dedupeMap = new Map<string, QueuedMutation>();
  for (const item of queue) {
    const existing = dedupeMap.get(item.dedupeKey);
    if (!existing || existing.createdAt <= item.createdAt) {
      dedupeMap.set(item.dedupeKey, item);
    }
  }
  return [...dedupeMap.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

const pruneQueue = (queue: QueuedMutation[]): QueuedMutation[] => {
  if (queue.length <= MAX_QUEUE_ITEMS) return queue;
  return queue.slice(queue.length - MAX_QUEUE_ITEMS);
};

export const queueMutation = (input: QueueMutationInput): void => {
  const dedupeKey = buildDedupeKey(input);
  const queue = getSyncQueueSnapshot();
  queue.push({
    id: crypto.randomUUID(),
    userId: input.userId,
    table: input.table,
    operation: input.operation,
    payload: input.payload,
    match: input.match,
    onConflict: input.onConflict,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    lastError: input.lastError,
    dedupeKey,
  });
  writeQueue(pruneQueue(compactQueue(queue)));
};

const applyMatch = (
  query: {
    eq: (column: string, value: unknown) => unknown;
  },
  match?: Record<string, unknown>,
) => {
  if (!match) return query;
  let cursor: unknown = query;
  for (const [column, value] of Object.entries(match)) {
    if (isObject(cursor) && typeof (cursor as any).eq === 'function') {
      cursor = (cursor as any).eq(column, value);
    }
  }
  return cursor;
};

const executeMutation = async (task: QueuedMutation): Promise<void> => {
  const table = task.table as any;
  switch (task.operation) {
    case 'insert': {
      const { error } = await supabase
        .from(table)
        .insert(task.payload as any);
      if (error) throw error;
      return;
    }
    case 'upsert': {
      const { error } = await supabase
        .from(table)
        .upsert(task.payload as any, {
          onConflict: task.onConflict,
        });
      if (error) throw error;
      return;
    }
    case 'update': {
      const query = supabase.from(table).update(task.payload as any);
      const scoped = applyMatch(query as any, task.match) as {
        then: PromiseLike<unknown>['then'];
      };
      const { error } = (await scoped) as { error: unknown };
      if (error) throw error;
      return;
    }
    case 'delete': {
      const query = supabase.from(table).delete();
      const scoped = applyMatch(query as any, task.match) as {
        then: PromiseLike<unknown>['then'];
      };
      const { error } = (await scoped) as { error: unknown };
      if (error) throw error;
      return;
    }
    default:
      return;
  }
};

export const getSyncQueueStats = (userId?: string | null): SyncQueueStats => {
  const queue = getSyncQueueSnapshot();
  const filtered = userId ? queue.filter((item) => item.userId === userId) : queue;
  const failed = filtered.filter((item) => !!item.lastError).length;
  const maxRetryReached = filtered.filter((item) => item.retryCount >= MAX_RETRY).length;
  return {
    total: filtered.length,
    pending: filtered.length - maxRetryReached,
    failed,
    maxRetryReached,
    isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
  };
};

export const subscribeSyncQueue = (handler: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const wrapped = () => handler();
  window.addEventListener(SYNC_EVENT, wrapped);
  window.addEventListener('online', wrapped);
  window.addEventListener('offline', wrapped);
  return () => {
    window.removeEventListener(SYNC_EVENT, wrapped);
    window.removeEventListener('online', wrapped);
    window.removeEventListener('offline', wrapped);
  };
};

export const drainSyncQueue = async (): Promise<void> => {
  if (drainInFlight) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  drainInFlight = true;
  try {
    const queue = getSyncQueueSnapshot();
    if (queue.length === 0) return;

    const keep: QueuedMutation[] = [];
    for (const task of queue) {
      if (task.userId !== user.id) {
        keep.push(task);
        continue;
      }

      if (task.retryCount >= MAX_RETRY) {
        keep.push(task);
        continue;
      }

      try {
        await executeMutation(task);
      } catch (error) {
        keep.push({
          ...task,
          retryCount: task.retryCount + 1,
          lastError: error instanceof Error ? error.message : 'Unknown sync error',
        });
      }
    }

    writeQueue(pruneQueue(compactQueue(keep)));
  } finally {
    drainInFlight = false;
  }
};

export const scheduleSyncQueueDrain = (delayMs = 700): void => {
  if (drainTimer) clearTimeout(drainTimer);
  drainTimer = setTimeout(() => {
    void drainSyncQueue();
  }, delayMs);
};
