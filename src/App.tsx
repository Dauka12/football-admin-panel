import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import GlobalLoadingIndicator from './components/ui/GlobalLoadingIndicator';
import { useAuthStore } from './store/auth';
import './styles/globals.css';

// Lazy load components for code splitting
const AuthPage = React.lazy(() => import('./pages/auth'));
const TeamsPage = React.lazy(() => import('./pages/teams'));
const TeamDetailPage = React.lazy(() => import('./pages/teams/detail'));
const PlayersPage = React.lazy(() => import('./pages/players'));
const PlayerDetailPage = React.lazy(() => import('./pages/players/detail'));
const TournamentsPage = React.lazy(() => import('./pages/tournaments'));
const TournamentDetailPage = React.lazy(() => import('./pages/tournaments/detail'));
const PermissionsPage = React.lazy(() => import('./pages/permissions'));
const AchievementsPage = React.lazy(() => import('./pages/achievements'));
const RegionsPage = React.lazy(() => import('./pages/regions'));
const CategoriesPage = React.lazy(() => import('./pages/categories'));

// Loading component for lazy-loaded routes
const RouteLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
  </div>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GlobalLoadingIndicator />      <Routes>
        {/* Auth routes */}
        <Route 
          path="/auth" 
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <AuthPage />
            </Suspense>
          } 
        />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/teams" replace />} />
          <Route 
            path="teams" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <TeamsPage />
              </Suspense>
            } 
          />
          <Route 
            path="teams/:id" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <TeamDetailPage />
              </Suspense>
            } 
          />
          <Route 
            path="players" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <PlayersPage />
              </Suspense>
            } 
          />
          <Route 
            path="players/:id" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <PlayerDetailPage />
              </Suspense>
            } 
          />
          <Route 
            path="tournaments" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <TournamentsPage />
              </Suspense>
            } 
          />
          <Route 
            path="tournaments/:id" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <TournamentDetailPage />
              </Suspense>
            } 
          />
          <Route 
            path="permissions" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <PermissionsPage />
              </Suspense>
            } 
          />
          <Route 
            path="achievements" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <AchievementsPage />
              </Suspense>
            } 
          />
          <Route 
            path="regions" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <RegionsPage />
              </Suspense>
            } 
          />
          <Route 
            path="categories" 
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <CategoriesPage />
              </Suspense>
            } 
          />
          {/* Other routes will be added here */}
        </Route>

        {/* Redirect from root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
