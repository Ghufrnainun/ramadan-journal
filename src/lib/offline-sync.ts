import { supabase } from '@/integrations/supabase/runtime-client';

type SyncOperation = 'insert' | 'upsert' | 'update' | 'delete';

interface QueuedMutation {
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

const CACHE_PREFIX = 'myramadhanku_cache';
const QUEUE_KEY = 'myramadhanku_sync_queue';
const MAX_RETRY = 8;

let drainInFlight = false;
let drainTimer: ReturnType<typeof setTimeout> | null = null;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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

const readQueue = (): QueuedMutation[] => {
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
  }
};

export const queueMutation = (input: QueueMutationInput): void => {
  const queue = readQueue();
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
  });
  writeQueue(queue);
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
    if (isObject(cursor) && typeof cursor.eq === 'function') {
      cursor = cursor.eq(column, value);
    }
  }
  return cursor;
};

const executeMutation = async (task: QueuedMutation): Promise<void> => {
  switch (task.operation) {
    case 'insert': {
      const { error } = await supabase
        .from(task.table)
        .insert(task.payload ?? {});
      if (error) throw error;
      return;
    }
    case 'upsert': {
      const { error } = await supabase
        .from(task.table)
        .upsert(task.payload ?? {}, {
          onConflict: task.onConflict,
        });
      if (error) throw error;
      return;
    }
    case 'update': {
      const query = supabase.from(task.table).update(task.payload ?? {});
      const scoped = applyMatch(query, task.match) as {
        then: PromiseLike<unknown>['then'];
      };
      const { error } = (await scoped) as { error: unknown };
      if (error) throw error;
      return;
    }
    case 'delete': {
      const query = supabase.from(task.table).delete();
      const scoped = applyMatch(query, task.match) as {
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

export const drainSyncQueue = async (): Promise<void> => {
  if (drainInFlight) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  drainInFlight = true;
  try {
    const queue = readQueue();
    if (queue.length === 0) return;

    const keep: QueuedMutation[] = [];
    for (const task of queue) {
      if (task.userId !== user.id) {
        keep.push(task);
        continue;
      }

      if (task.retryCount >= MAX_RETRY) continue;

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

    writeQueue(keep);
  } finally {
    drainInFlight = false;
  }
};

export const scheduleSyncQueueDrain = (delayMs = 700): void => {
  if (drainTimer) {
    clearTimeout(drainTimer);
  }
  drainTimer = setTimeout(() => {
    void drainSyncQueue();
  }, delayMs);
};

