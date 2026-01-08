import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Properties from './pages/Properties';
import AdvancedSearch from './pages/AdvancedSearch';
import AddProperty from './pages/AddProperty';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import DelegateManagement from './pages/DelegateManagement';
import MandateDashboard from './pages/MandateDashboard';
import Settings from './pages/Settings';
import About from './pages/About';
import Footer from './components/Footer';
import GeolocationBanner from './components/GeolocationBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;
  if (!token) return <Navigate to="/login" />;
  return children;
};

const PageLayout = () => {
  return (
    <>
      <Navbar />
      <main className="grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminMandates from './pages/admin/AdminMandates';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <GeolocationBanner />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin-dashboard/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/properties" element={<AdminProperties />} />
                    <Route path="/mandates" element={<AdminMandates />} />
                    <Route path="/transactions" element={<AdminTransactions />} />
                    <Route path="/analytics" element={<AdminAnalytics />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />

            {/* Public and Standard Protected Routes */}
            <Route path="/" element={<PageLayout />}>
              <Route index element={<Home />} />
              <Route path="properties" element={<Properties />} />
              <Route path="advanced-search" element={<AdvancedSearch />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="add-property" element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              } />
              <Route path="property/:id" element={<PropertyDetails />} />
              <Route path="delegate-management" element={
                <ProtectedRoute>
                  <DelegateManagement />
                </ProtectedRoute>
              } />
              <Route path="mandate-dashboard" element={
                <ProtectedRoute>
                  <MandateDashboard />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="about" element={<About />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
