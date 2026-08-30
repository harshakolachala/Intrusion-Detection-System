import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalNavbar from "./components/GlobalNavbar";
import Layout from "./components/Layout";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { Dashboard } from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";
import PredictionHistory from "./pages/PredictionHistory";
import AuditLogs from "./pages/AuditLogs";
import Chatbot from "./pages/Chatbot";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const SINGLE_NAV_STYLES = `
  .sentinel-root > header,
  .login-root > header,
  .register-root > header {
    display: none !important;
  }
`;

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const PublicOnlyPage = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <>
    <style>{SINGLE_NAV_STYLES}</style>
    <GlobalNavbar />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyPage><Login /></PublicOnlyPage>} />
      <Route path="/register" element={<PublicOnlyPage><Register /></PublicOnlyPage>} />
      <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
      <Route path="/predict" element={<ProtectedPage><Predict /></ProtectedPage>} />
      <Route path="/analytics" element={<ProtectedPage><Analytics /></ProtectedPage>} />
      <Route path="/alerts" element={<ProtectedPage><Alerts /></ProtectedPage>} />
      <Route path="/incidents" element={<ProtectedPage><Incidents /></ProtectedPage>} />
      <Route path="/prediction-history" element={<ProtectedPage><PredictionHistory /></ProtectedPage>} />
      <Route path="/audit" element={<ProtectedPage><AuditLogs /></ProtectedPage>} />
      <Route path="/chatbot" element={<ProtectedPage><Chatbot /></ProtectedPage>} />
      <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;
