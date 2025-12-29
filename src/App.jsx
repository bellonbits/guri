import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BuyPage from './pages/BuyPage';
import SellPage from './pages/SellPage';
import RentPage from './pages/RentPage';
import ListingsPage from './pages/ListingsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ComparePage from './pages/ComparePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './admin/layout/AdminLayout';
import AdminRoute from './admin/components/AdminRoute';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProperties from './admin/pages/AdminProperties';
import AdminUsers from './admin/pages/AdminUsers';
import AdminAnalytics from './admin/pages/AdminAnalytics';
import AdminMonitoring from './admin/pages/AdminMonitoring';
import AdminSettings from './admin/pages/AdminSettings';
import AdminPropertyForm from './admin/pages/AdminPropertyForm';
import './index.css';
import './App.css';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <ScrollToTop />
        <Routes>
          {/* Public Routes with Header/Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/rent" element={<RentPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/property/:slug" element={<PropertyDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes - Clean Layout */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Routes>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="analytics" element={<AdminAnalytics />} />


                    <Route path="properties" element={<AdminProperties />} />
                    <Route path="properties/create" element={<AdminPropertyForm />} />
                    <Route path="properties/edit/:id" element={<AdminPropertyForm />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="monitoring" element={<AdminMonitoring />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Routes>
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
