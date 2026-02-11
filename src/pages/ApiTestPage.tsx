import React, { useCallback, useEffect, useState } from 'react';
import { getDhikr, getHadithList } from '@/lib/api/muslim-data';
import { EQuranApi } from '@/lib/api/equran';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Muslim API - Dhikr', status: 'pending' },
    { name: 'Muslim API - Hadith', status: 'pending' },
    { name: 'Nominatim (OpenStreetMap)', status: 'pending' },
    { name: 'eQuran Proxy - Surah List', status: 'pending' },
    { name: 'eQuran Proxy - Shalat Schedule', status: 'pending' },
  ]);

  const updateResult = useCallback((
    name: string,
    status: 'success' | 'error',
    message?: string,
    duration?: number,
  ) => {
    setResults((prev) =>
      prev.map((r) =>
        r.name === name ? { ...r, status, message, duration } : r,
      ),
    );
  }, []);

  const runTests = useCallback(async () => {
    // Reset all to pending
    setResults((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'pending',
        message: undefined,
        duration: undefined,
      })),
    );

    const measures: Record<string, number> = {};
    const startMeasure = (name: string) => {
      measures[name] = performance.now();
    };
    const endMeasure = (name: string) => performance.now() - measures[name];

    // 1. Muslim API - Dhikr
    startMeasure('dhikr');
    try {
      await getDhikr('pagi');
      updateResult(
        'Muslim API - Dhikr',
        'success',
        'Fetched morning dhikr',
        endMeasure('dhikr'),
      );
    } catch (error: unknown) {
      updateResult(
        'Muslim API - Dhikr',
        'error',
        getErrorMessage(error),
        endMeasure('dhikr'),
      );
    }

    // 2. Muslim API - Hadith
    startMeasure('hadith');
    try {
      await getHadithList();
      updateResult(
        'Muslim API - Hadith',
        'success',
        'Fetched hadith list',
        endMeasure('hadith'),
      );
    } catch (error: unknown) {
      updateResult(
        'Muslim API - Hadith',
        'error',
        getErrorMessage(error),
        endMeasure('hadith'),
      );
    }

    // 3. Nominatim
    startMeasure('nominatim');
    try {
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?format=json&q=Jakarta',
      );
      if (!res.ok) throw new Error(res.statusText);
      await res.json();
      updateResult(
        'Nominatim (OpenStreetMap)',
        'success',
        'Geocoded Jakarta',
        endMeasure('nominatim'),
      );
    } catch (error: unknown) {
      updateResult(
        'Nominatim (OpenStreetMap)',
        'error',
        getErrorMessage(error),
        endMeasure('nominatim'),
      );
    }

    // 4. eQuran Proxy - Surah List
    startMeasure('surah');
    try {
      const api = new EQuranApi();
      await api.getAllSurahs();
      updateResult(
        'eQuran Proxy - Surah List',
        'success',
        'Fetched surah list',
        endMeasure('surah'),
      );
    } catch (error: unknown) {
      updateResult(
        'eQuran Proxy - Surah List',
        'error',
        getErrorMessage(error),
        endMeasure('surah'),
      );
    }

    // 5. eQuran Proxy - Shalat Schedule
    startMeasure('shalat');
    try {
      const api = new EQuranApi();
      // Test using Jakarta location
      const now = new Date();
      await api.getJadwalShalat(
        'DKI Jakarta',
        'Jakarta Pusat',
        now.getMonth() + 1,
        now.getFullYear(),
      );
      updateResult(
        'eQuran Proxy - Shalat Schedule',
        'success',
        'Fetched schedule',
        endMeasure('shalat'),
      );
    } catch (error: unknown) {
      updateResult(
        'eQuran Proxy - Shalat Schedule',
        'error',
        getErrorMessage(error),
        endMeasure('shalat'),
      );
    }
  }, [updateResult]);

  useEffect(() => {
    void runTests();
  }, [runTests]);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white font-sans">
      <h1 className="text-3xl font-bold mb-8 text-amber-500">
        API Connectivity Tests
      </h1>

      <div className="grid gap-4 max-w-2xl">
        {results.map((result) => (
          <div
            key={result.name}
            className={`p-4 rounded-xl border transition-colors ${
              result.status === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : result.status === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">{result.name}</span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  result.status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : result.status === 'error'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-slate-700 text-slate-300 animate-pulse'
                }`}
              >
                {result.status}
              </span>
            </div>

            {result.message && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>{result.message}</span>
                {result.duration && (
                  <span className="font-mono text-slate-500">
                    {result.duration.toFixed(0)} ms
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={runTests}
        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors shadow-lg hover:shadow-blue-500/20"
      >
        Rerun Tests
      </button>

      <div className="mt-12 p-4 bg-slate-900 rounded-lg border border-slate-800 text-sm text-slate-500">
        <p>
          <strong>Note:</strong> "eQuran Proxy" depends on the Supabase Edge
          Function `equran-proxy`. If it fails with 500/503/404, verify the
          Supabase project status and ensure `VITE_SUPABASE_URL` is correct.
        </p>
      </div>
    </div>
  );
};

export default ApiTestPage;
