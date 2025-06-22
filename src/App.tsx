import React, { Suspense } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import GlobalLoadingIndicator from './components/ui/GlobalLoadingIndicator';
import { useAuthStore } from './store/auth';
import './styles/globals.css';

// Lazy load components for code splitting
const AuthPage = React.lazy(() => import('./pages/auth'));
const TeamsPage = React.lazy(() => import('./pages/teams'));
const TeamDetailPage = React.lazy(() => import('./pages/teams/detail'));
const PlayersPage = React.lazy(() => import('./pages/players'));
const PlayerDetailPage = React.lazy(() => import('./pages/players/detail'));
const SportTypesPage = React.lazy(() => import('./pages/sportTypes'));
const SportTypeDetailPage = React.lazy(() => import('./pages/sportTypes/detail'));
const SportClubsPage = React.lazy(() => import('./pages/sportClubs'));
const SportClubDetailPage = React.lazy(() => import('./pages/sportClubs/detail'));
const CitiesPage = React.lazy(() => import('./pages/cities'));
const CityDetailPage = React.lazy(() => import('./pages/cities/detail'));
const TournamentsPage = React.lazy(() => import('./pages/tournaments'));
const TournamentDetailPage = React.lazy(() => import('./pages/tournaments/detail'));
const TournamentCategoriesPage = React.lazy(() => import('./pages/tournamentCategories'));
const TournamentCategoryDetailPage = React.lazy(() => import('./pages/tournamentCategories/detail'));
const MatchesPage = React.lazy(() => import('./pages/matches'));
const MatchDetailPage = React.lazy(() => import('./pages/matches/detail'));
const PermissionsPage = React.lazy(() => import('./pages/permissions'));
const AchievementsPage = React.lazy(() => import('./pages/achievements'));
const AchievementDetailPage = React.lazy(() => import('./pages/achievements/detail'));
const RegionsPage = React.lazy(() => import('./pages/regions'));
const CategoriesPage = React.lazy(() => import('./pages/categories'));
const PlaygroundsPage = React.lazy(() => import('./pages/playgrounds'));
const PlaygroundDetailPage = React.lazy(() => import('./pages/playgrounds/detail'));
const UsersPage = React.lazy(() => import('./pages/users'));
const UserDetailPage = React.lazy(() => import('./pages/users/detail'));
const FilesPage = React.lazy(() => import('./pages/files'));

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
    <ErrorBoundary>
      <BrowserRouter>
        <GlobalLoadingIndicator />
        <Routes>
          {/* Auth routes */}
          <Route
            path="/auth"
            element={
              <Suspense fallback={<RouteLoadingSpinner />}>
                <ErrorBoundary>
                  <AuthPage />
                </ErrorBoundary>
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
                  <ErrorBoundary>
                    <TeamsPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />          <Route
              path="teams/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <TeamDetailPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />          <Route
              path="players"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <PlayersPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />          <Route
              path="players/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <PlayerDetailPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />

            <Route
              path="sport-types"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <SportTypesPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />            <Route
              path="sport-types/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <SportTypeDetailPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />

            <Route
              path="sport-clubs"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <SportClubsPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />

            <Route
              path="sport-clubs/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <SportClubDetailPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />

            <Route
              path="cities"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <CitiesPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="cities/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <CityDetailPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="tournaments"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <TournamentsPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />          <Route
              path="tournaments/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <TournamentDetailPage />
                </Suspense>
              }
            />
            <Route
              path="tournament-categories"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <TournamentCategoriesPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="tournament-categories/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <TournamentCategoryDetailPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="matches"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <MatchesPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />          <Route
              path="matches/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <MatchDetailPage />
                  </ErrorBoundary>
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
            />          <Route
              path="achievements"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <AchievementsPage />
                </Suspense>
              }
            />
            <Route
              path="achievements/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <AchievementDetailPage />
                  </ErrorBoundary>
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
              path="playgrounds"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <PlaygroundsPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="playgrounds/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <PlaygroundDetailPage />
                  </ErrorBoundary>
                </Suspense>
              } />            <Route
              path="files"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <FilesPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <UsersPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="users/:id"
              element={
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <ErrorBoundary>
                    <UserDetailPage />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            {/* Other routes will be added here */}
          </Route>        {/* Redirect from root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Not Found Route (follows React Router v7 pattern) */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen bg-darkest-bg">
              <h1 className="text-3xl font-bold text-gold mb-4">404 - Page Not Found</h1>
              <p className="text-white mb-8">The page you are looking for doesn't exist.</p>
              <Link to="/dashboard" className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors">
                Return to Dashboard
              </Link>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
