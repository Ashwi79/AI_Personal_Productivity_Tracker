import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TimerPage from './pages/TimerPage';
import InsightsPage from './pages/InsightsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ActivityPage from './pages/ActivityPage';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { token, restoreToken } = useAuthStore();

  useEffect(() => {
    restoreToken(token);
  }, [token, restoreToken]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="timer" element={<TimerPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="activity" element={<ActivityPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
