import { beforeEach, describe, expect, it } from 'vitest';
import { trackClientEvent } from '@/lib/telemetry';

describe('telemetry buffer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores client events in localStorage buffer', () => {
    trackClientEvent({
      level: 'error',
      type: 'boot_error',
      message: 'boot failed',
      timestamp: '2026-02-11T00:00:00.000Z',
      pathname: '/auth',
      userAgent: 'vitest',
    });

    const raw = localStorage.getItem('myramadhanku_telemetry_buffer');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw ?? '[]') as Array<{ message: string }>;
    expect(parsed.at(-1)?.message).toBe('boot failed');
  });
});

