import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DemoPage from './pages/DemoPage';
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
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
