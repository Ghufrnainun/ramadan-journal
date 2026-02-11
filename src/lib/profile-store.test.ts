import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalProfileStore } from '@/lib/profile-store';

describe('LocalProfileStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('migrates legacy onboardingCompleted=true to setup_completed_at', async () => {
    localStorage.setItem(
      'myramadhanku_profile',
      JSON.stringify({
        language: 'id',
        onboardingCompleted: true,
      }),
    );

    const store = new LocalProfileStore();
    const profile = await store.getProfile();

    expect(profile.onboardingCompleted).toBe(true);
    expect(profile.setup_completed_at).toBeTruthy();
  });

  it('marks setup complete and keeps backward compatibility flag', async () => {
    const store = new LocalProfileStore();

    await store.markSetupComplete();
    const profile = await store.getProfile();

    expect(profile.setup_completed_at).toBeTruthy();
    expect(profile.onboardingCompleted).toBe(true);
    await expect(store.isSetupComplete()).resolves.toBe(true);
  });

  it('clears setup completion state', async () => {
    const store = new LocalProfileStore();
    await store.markSetupComplete();

    await store.clearSetup();
    const profile = await store.getProfile();

    expect(profile.setup_completed_at).toBeNull();
    expect(profile.onboardingCompleted).toBe(false);
    await expect(store.isSetupComplete()).resolves.toBe(false);
  });
});

