import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import DhikrPage from './pages/DhikrPage';
import DoaPage from './pages/DoaPage';
import TrackerPage from './pages/TrackerPage';
import QuranPage from './pages/QuranPage';
import SettingsPage from './pages/SettingsPage';
import ReflectionPage from './pages/ReflectionPage';
import BookmarksPage from './pages/BookmarksPage';
import CalendarPage from './pages/CalendarPage';
import HadithPage from './pages/HadithPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dhikr" element={<DhikrPage />} />
            <Route path="/hadith" element={<HadithPage />} />
            <Route path="/doa" element={<DoaPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/quran" element={<QuranPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/reflection" element={<ReflectionPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
