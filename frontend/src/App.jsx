import React from 'react';
import {BrowserRouter as Router, Routes, Route, Outlet} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Properties from './pages/Properties';
import AdvancedSearch from './pages/AdvancedSearch';
import AddProperty from './pages/AddProperty';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import DelegateManagement from './pages/DelegateManagement';
import MandateDashboard from './pages/MandateDashboard';
import MyVisits from './pages/MyVisits';
import Settings from './pages/Settings';
import About from './pages/About';
import PaymentPage from './pages/PaymentPage';
import MyPayments from './pages/MyPayments';
import MyOccupations from './pages/MyOccupations';
import Footer from './components/Footer';
import GeolocationBanner from './components/GeolocationBanner';
import {AuthProvider, useAuth} from './context/AuthContext';
import {Navigate} from 'react-router-dom';
import {useEffect} from 'react';

const ProtectedRoute = ({children}) => {
    const {token, loading} = useAuth();
    if (loading) 
        return <div>Chargement...</div>;
    
    if (!token) 
        return <Navigate to="/login"/>;
    
    return children;
};

const PageLayout = () => {
    return (
        <>
            <Navbar/>
            <main className="grow pt-16">
                <Outlet/>
            </main>
            <Footer/>
        </>
    );
};

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminMandates from './pages/admin/AdminMandates';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminPayments from './pages/admin/AdminPayments';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import PublisherRoute from './components/PublisherRoute';

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
                    <GeolocationBanner/>
                    <Routes> 
                        {/* Admin Routes */}
                        <Route path="/admin-dashboard" element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="properties" element={<AdminProperties />} />
                            <Route path="mandates" element={<AdminMandates />} />
                            <Route path="transactions" element={<AdminTransactions />} />
                            <Route path="payments" element={<AdminPayments />} />
                            <Route path="disputes" element={<AdminDisputes />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="occupations" element={<MyOccupations />} />
                        </Route> {/* Public and Standard Protected Routes */}
                        <Route path="/"
                            element={<PageLayout/>}>
                            <Route index
                                element={<Home/>}/>
                            <Route path="properties"
                                element={<Properties/>}/>
                            <Route path="advanced-search"
                                element={<AdvancedSearch/>}/>
                            <Route path="login"
                                element={<Login/>}/>
                            <Route path="register"
                                element={<Register/>}/>
                            <Route path="forgot-password"
                                element={<ForgotPassword/>}/>
                            <Route path="reset-password"
                                element={<ResetPassword/>}/>
                            <Route path="profile"
                                element={
                                    <ProtectedRoute><Profile/></ProtectedRoute>
                                }/>
                            <Route path="add-property"
                                element={
                                    <PublisherRoute><AddProperty/></PublisherRoute>
                                }/>
                            <Route path="property/:id"
                                element={<PropertyDetails/>}/>
                            <Route path="delegate-management"
                                element={
                                    <ProtectedRoute><DelegateManagement/></ProtectedRoute>
                                }/>
                            <Route path="mandate-dashboard"
                                element={
                                    <ProtectedRoute><MandateDashboard/></ProtectedRoute>
                                }/>
                            <Route path="visits" element={
                                <ProtectedRoute><MyVisits/></ProtectedRoute>
                            } />
                            <Route path="payment/:occupationId"
                                element={
                                    <ProtectedRoute><PaymentPage/></ProtectedRoute>
                                }/>
                            <Route path="my-payments"
                                element={
                                    <ProtectedRoute><MyPayments/></ProtectedRoute>
                                }/>
                            <Route path="my-occupations"
                                element={
                                    <ProtectedRoute><MyOccupations/></ProtectedRoute>
                                }/>
                            <Route path="settings"
                                element={
                                    <ProtectedRoute><Settings/></ProtectedRoute>
                                }/>
                            <Route path="about"
                                element={<About/>}/>
                        </Route>
                    </Routes>
                </div>
            </Router>
            <Toaster position="top-right" />
        </AuthProvider>
    );
}

export default App;
