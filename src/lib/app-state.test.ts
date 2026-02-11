import { describe, expect, it } from 'vitest';
import { deriveAppState, getRedirectTarget } from '@/lib/app-state';

describe('deriveAppState', () => {
  it('returns loading while auth is unresolved', () => {
    expect(
      deriveAppState({
        authResolved: false,
        userId: null,
        profileResolved: false,
        setupCompletedAt: null,
      }),
    ).toBe('loading');
  });

  it('returns loading while profile is unresolved', () => {
    expect(
      deriveAppState({
        authResolved: true,
        userId: 'u1',
        profileResolved: false,
        setupCompletedAt: null,
      }),
    ).toBe('loading');
  });

  it('returns guest states correctly', () => {
    expect(
      deriveAppState({
        authResolved: true,
        userId: null,
        profileResolved: true,
        setupCompletedAt: null,
      }),
    ).toBe('guest');

    expect(
      deriveAppState({
        authResolved: true,
        userId: null,
        profileResolved: true,
        setupCompletedAt: '2026-02-11T10:00:00.000Z',
      }),
    ).toBe('guest_ready');
  });

  it('returns signed-in states correctly', () => {
    expect(
      deriveAppState({
        authResolved: true,
        userId: 'u1',
        profileResolved: true,
        setupCompletedAt: null,
      }),
    ).toBe('user_needs_setup');

    expect(
      deriveAppState({
        authResolved: true,
        userId: 'u1',
        profileResolved: true,
        setupCompletedAt: '2026-02-11T10:00:00.000Z',
      }),
    ).toBe('user_ready');
  });
});

describe('getRedirectTarget', () => {
  it('keeps guests on public pages', () => {
    expect(getRedirectTarget('guest', '/')).toBeNull();
    expect(getRedirectTarget('guest', '/demo')).toBeNull();
  });

  it('redirects guests away from app and onboarding routes', () => {
    expect(getRedirectTarget('guest', '/dashboard')).toBe('/auth');
    expect(getRedirectTarget('guest', '/onboarding')).toBe('/auth');
  });

  it('forces signed-in users without setup to onboarding', () => {
    expect(getRedirectTarget('user_needs_setup', '/')).toBe('/onboarding');
    expect(getRedirectTarget('user_needs_setup', '/dashboard')).toBe(
      '/onboarding',
    );
    expect(getRedirectTarget('user_needs_setup', '/onboarding')).toBeNull();
  });

  it('moves signed-in setup-complete users away from auth/onboarding', () => {
    expect(getRedirectTarget('user_ready', '/auth')).toBe('/dashboard');
    expect(getRedirectTarget('user_ready', '/onboarding')).toBe('/dashboard');
    expect(getRedirectTarget('user_ready', '/dashboard')).toBeNull();
  });
});

