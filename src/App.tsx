import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AIAdvisor from './pages/AIAdvisor';
import CropDoctor from './pages/CropDoctor';
import SoilIntelligence from './pages/SoilIntelligence';
import Weather from './pages/Weather';
import Irrigation from './pages/Irrigation';
import CropRecommendation from './pages/CropRecommendation';
import MyFarm from './pages/MyFarm';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.user) return <Navigate to="/login" replace />;
  if (!state.user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { state } = useApp();
  return (
    <Routes>
      <Route path="/" element={state.user?.onboardingComplete ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={state.user?.onboardingComplete ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={state.user?.onboardingComplete ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={state.user && !state.user.onboardingComplete ? <Onboarding /> : <Navigate to={state.user ? '/dashboard' : '/login'} replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ai-advisor" element={<ProtectedRoute><AIAdvisor /></ProtectedRoute>} />
      <Route path="/crop-doctor" element={<ProtectedRoute><CropDoctor /></ProtectedRoute>} />
      <Route path="/soil" element={<ProtectedRoute><SoilIntelligence /></ProtectedRoute>} />
      <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
      <Route path="/irrigation" element={<ProtectedRoute><Irrigation /></ProtectedRoute>} />
      <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
      <Route path="/my-farm" element={<ProtectedRoute><MyFarm /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
