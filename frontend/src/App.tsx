import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';

// Layout
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

function App() {
  const { loadUser, isAuthenticated } = useUserStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div {...pageTransition}>
                    <Dashboard />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div {...pageTransition}>
                    <Transactions />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div {...pageTransition}>
                    <Budget />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div {...pageTransition}>
                    <Reports />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div {...pageTransition}>
                    <Alerts />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <motion.div {...pageTransition}>
                    <Profile />
                  </motion.div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/welcome"} replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;

