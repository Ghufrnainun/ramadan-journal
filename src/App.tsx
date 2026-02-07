import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-dvh bg-[#020617] text-slate-300 flex items-center justify-center">
                Loading...
              </div>
            }
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/demo" element={<DemoPage />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/onboarding" element={
                <ProtectedRoute><OnboardingPage /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />
              <Route path="/dhikr" element={
                <ProtectedRoute><DhikrPage /></ProtectedRoute>
              } />
              <Route path="/hadith" element={
                <ProtectedRoute><HadithPage /></ProtectedRoute>
              } />
              <Route path="/doa" element={
                <ProtectedRoute><DoaPage /></ProtectedRoute>
              } />
              <Route path="/tracker" element={
                <ProtectedRoute><TrackerPage /></ProtectedRoute>
              } />
              <Route path="/quran" element={
                <ProtectedRoute><QuranPage /></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
              } />
              <Route path="/reflection" element={
                <ProtectedRoute><ReflectionPage /></ProtectedRoute>
              } />
              <Route path="/bookmarks" element={
                <ProtectedRoute><BookmarksPage /></ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute><CalendarPage /></ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute><GoalsPage /></ProtectedRoute>
              } />
              <Route path="/stats" element={
                <ProtectedRoute><StatsPage /></ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
