import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSyncQueueSnapshot,
  getSyncQueueStats,
  queueMutation,
} from '@/lib/offline-sync';

describe('offline-sync queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('dedupes upsert entries by conflict identity', () => {
    queueMutation({
      userId: 'u1',
      table: 'daily_status',
      operation: 'upsert',
      payload: { user_id: 'u1', date: '2026-02-01', mood: 'calm' },
      onConflict: 'user_id,date',
    });
    queueMutation({
      userId: 'u1',
      table: 'daily_status',
      operation: 'upsert',
      payload: { user_id: 'u1', date: '2026-02-01', mood: 'heavy' },
      onConflict: 'user_id,date',
    });
    queueMutation({
      userId: 'u1',
      table: 'daily_status',
      operation: 'upsert',
      payload: { user_id: 'u1', date: '2026-02-02', mood: 'calm' },
      onConflict: 'user_id,date',
    });

    const queue = getSyncQueueSnapshot();
    expect(queue).toHaveLength(2);
    expect(queue.map((item) => item.payload?.date).sort()).toEqual([
      '2026-02-01',
      '2026-02-02',
    ]);
  });

  it('prunes queue to max size', () => {
    for (let i = 0; i < 550; i += 1) {
      queueMutation({
        userId: 'u1',
        table: 'ramadan_goals',
        operation: 'insert',
        payload: { id: `goal-${i}`, title: `Goal ${i}` },
      });
    }

    const queue = getSyncQueueSnapshot();
    expect(queue.length).toBeLessThanOrEqual(500);
  });

  it('reports sync stats per user', () => {
    queueMutation({
      userId: 'u1',
      table: 'daily_status',
      operation: 'upsert',
      payload: { user_id: 'u1', date: '2026-02-01' },
      onConflict: 'user_id,date',
      lastError: 'timeout',
    });
    queueMutation({
      userId: 'u2',
      table: 'daily_status',
      operation: 'upsert',
      payload: { user_id: 'u2', date: '2026-02-01' },
      onConflict: 'user_id,date',
    });

    const statsUser1 = getSyncQueueStats('u1');
    expect(statsUser1.total).toBe(1);
    expect(statsUser1.failed).toBe(1);

    const statsAll = getSyncQueueStats();
    expect(statsAll.total).toBe(2);
  });
});

