import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import AppGate from '@/components/AppGate';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import { dictionaries } from '@/i18n';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DemoPage = lazy(() => import('./pages/DemoPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DhikrPage = lazy(() => import('./pages/DhikrPage'));
const DoaPage = lazy(() => import('./pages/DoaPage'));
const TrackerPage = lazy(() => import('./pages/TrackerPage'));
const QuranPage = lazy(() => import('./pages/QuranPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReflectionPage = lazy(() => import('./pages/ReflectionPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const HadithPage = lazy(() => import('./pages/HadithPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();
const loadingText = dictionaries.id.common.loading;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense
              fallback={
                <div className="min-h-dvh bg-[#020617] text-slate-300 flex items-center justify-center">
                  {loadingText}
                </div>
              }
            >
              <Routes>
              {/* Public routes - no guard */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/demo" element={<DemoPage />} />

              {/* Onboarding - requires auth but NOT setup completion */}
              <Route
                path="/onboarding"
                element={
                  <AppGate requireAuth>
                    <OnboardingPage />
                  </AppGate>
                }
              />

              {/* App routes - require auth AND setup completion */}
              <Route
                path="/dashboard"
                element={
                  <AppGate requireAuth requireSetup>
                    <DashboardPage />
                  </AppGate>
                }
              />
              <Route
                path="/dhikr"
                element={
                  <AppGate requireAuth requireSetup>
                    <DhikrPage />
                  </AppGate>
                }
              />
              <Route
                path="/hadith"
                element={
                  <AppGate requireAuth requireSetup>
                    <HadithPage />
                  </AppGate>
                }
              />
              <Route
                path="/doa"
                element={
                  <AppGate requireAuth requireSetup>
                    <DoaPage />
                  </AppGate>
                }
              />
              <Route
                path="/tracker"
                element={
                  <AppGate requireAuth requireSetup>
                    <TrackerPage />
                  </AppGate>
                }
              />
              <Route
                path="/quran"
                element={
                  <AppGate requireAuth requireSetup>
                    <QuranPage />
                  </AppGate>
                }
              />
              <Route
                path="/settings"
                element={
                  <AppGate requireAuth requireSetup>
                    <SettingsPage />
                  </AppGate>
                }
              />
              <Route
                path="/reflection"
                element={
                  <AppGate requireAuth requireSetup>
                    <ReflectionPage />
                  </AppGate>
                }
              />
              <Route
                path="/bookmarks"
                element={
                  <AppGate requireAuth requireSetup>
                    <BookmarksPage />
                  </AppGate>
                }
              />
              <Route
                path="/calendar"
                element={
                  <AppGate requireAuth requireSetup>
                    <CalendarPage />
                  </AppGate>
                }
              />
              <Route
                path="/goals"
                element={
                  <AppGate requireAuth requireSetup>
                    <GoalsPage />
                  </AppGate>
                }
              />
              <Route
                path="/stats"
                element={
                  <AppGate requireAuth requireSetup>
                    <StatsPage />
                  </AppGate>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </QueryClientProvider>
);

export default App;
