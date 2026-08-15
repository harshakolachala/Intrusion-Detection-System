import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// SOC Console Core Pages
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Analytics from './pages/Analytics';

// Management & Intelligence Pages
import Alerts from './pages/Alerts';
import Incidents from './pages/Incidents';
import PredictionHistory from './pages/PredictionHistory';
import AuditLogs from './pages/AuditLogs';
import Chatbot from './pages/Chatbot';

// Fallback Page
import NotFound from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Enterprise Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Portal Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Security Operations Console Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <Layout>
                  <Predict />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Alerts />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <Layout>
                  <Incidents />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/prediction-history"
            element={
              <ProtectedRoute>
                <Layout>
                  <PredictionHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <Layout>
                  <AuditLogs />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Layout>
                  <Chatbot />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;