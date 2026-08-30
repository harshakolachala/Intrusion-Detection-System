import React from "react";
import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeModeProvider } from "./context/ThemeModeContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Public & Auth Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// SOC Console Core Pages
import { Dashboard } from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Analytics from "./pages/Analytics";

// Management & Intelligence Pages
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";
import PredictionHistory from "./pages/PredictionHistory";
import AuditLogs from "./pages/AuditLogs";
import Chatbot from "./pages/Chatbot";

// Fallback Page
import NotFound from "./pages/NotFound";

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <Routes>
          {/* =================================================
              PUBLIC ENTERPRISE LANDING PAGE
          ================================================= */}

          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* =================================================
              AUTHENTICATION PORTAL
          ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =================================================
              DASHBOARD
          ================================================= */}

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

          {/* =================================================
              LIVE PREDICTION
          ================================================= */}

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

          {/* =================================================
              ANALYTICS
          ================================================= */}

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

          {/* =================================================
              ALERT MANAGEMENT
          ================================================= */}

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

          {/* =================================================
              INCIDENT MANAGEMENT
          ================================================= */}

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

          {/* =================================================
              PREDICTION HISTORY
          ================================================= */}

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

          {/* =================================================
              AUDIT LOGS
          ================================================= */}

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

          {/* =================================================
              AI SECURITY ASSISTANT
          ================================================= */}

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

          {/* =================================================
              FALLBACK
          ================================================= */}

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;