import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import "./App.css";
import { loadExternalScripts } from "./utils/initScripts";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { PackageProvider } from './context/PackageContext';
import PackageDebug from './components/PackageDebug';

// Common Pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Services from "./pages/Services.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Payment from "./pages/Payment.jsx";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import AdminUsers from "./pages/Admin/Users.jsx";
import AdminPosts from "./pages/Admin/Posts.jsx";
import SellerRequests from "./pages/Admin/SellerRequests.jsx";
import Analytics from "./pages/Admin/Analytics.jsx";
import AdminStaff from "./pages/Admin/Staff.jsx";
import AdminViewings from "./pages/Admin/Viewings.jsx";
import Activities from "./pages/Admin/Activities.jsx";
import NotificationManager from "./pages/Admin/NotificationManager.jsx";
import SendNotification from "./pages/Admin/SendNotification.jsx";

// Buyer Pages
import Properties from "./pages/Buyer/Properties.jsx";
import PropertyDetail from "./pages/Buyer/PropertyDetail.jsx";
import SellerProperties from "./pages/Buyer/SellerProperties.jsx";
import MyViewings from "./pages/Buyer/MyViewings.jsx";
import Devices from "./pages/Buyer/Devices.jsx";
import DeviceDetail from "./pages/Buyer/DeviceDetail.jsx";

// Chat
import Chat from "./pages/Chat.jsx";
import ChatIconsManager from "./components/ChatIconsManager.jsx";

// Notifications
import Notifications from "./pages/Notifications.jsx";
import TestNotifications from "./pages/TestNotifications.jsx";

// Seller Pages
import SellerPosts from "./pages/Seller/Posts.jsx";
import CreatePost from "./pages/Seller/CreatePost.jsx";
import CreateHouse from "./pages/Seller/CreateHouse.jsx";
import MyHome from "./pages/Seller/MyHome.jsx";
import ModernDashboard from "./pages/Seller/ModernDashboard.jsx";
import ViewingManagement from "./pages/Seller/ViewingManagement.jsx";
import StaffLayout from "./components/StaffLayout.jsx";
import StaffLoginRedirect from "./pages/Staff/StaffLoginRedirect.jsx";
import StaffDashboard from "./pages/Staff/Dashboard.jsx";
import StaffViewings from "./pages/Staff/Viewings.jsx";
import ProductionIdentityVerification from "./pages/Staff/ProductionIdentityVerification.jsx";

// Package Pages
import PackageSelection from "./pages/Packages/PackageSelection.jsx";
import PaymentPage from "./pages/Payment/PaymentPage.jsx";
import PaymentSuccess from "./pages/Payment/PaymentSuccess.jsx";
import PaymentFailed from "./pages/Payment/PaymentFailed.jsx";
import PaymentStatus from "./pages/PaymentStatus.jsx";

// Removed duplicate imports - already imported above

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import RequestUpgrade from './pages/Buyer/RequestUpgrade.jsx';
import MyUpgradeRequests from './pages/Buyer/MyUpgradeRequests.jsx';
import SignContract from './pages/Buyer/SignContract.jsx';
// Loading component
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default function App() {
  useEffect(() => {
    loadExternalScripts();
    
    // Khởi tạo WebSocket connection
    import('./utils/websocketInit').then(({ initializeWebSocket }) => {
      initializeWebSocket();
    });
  }, []);

  return (
    <AuthProvider>
      <PackageProvider>
      <BrowserRouter>
        <ChatIconsManager />
        <PackageDebug />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* User Routes - Requires Authentication */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/test-notifications" element={<ProtectedRoute><TestNotifications /></ProtectedRoute>} />

          {/* Package Routes */}
          <Route path="/packages" element={<PackageSelection />} />
          <Route path="/package" element={<PackageSelection />} />
          <Route path="/package/payment" element={<ProtectedRoute requiredRole={["Seller", "Buyer"]}><PaymentPage /></ProtectedRoute>} />
          <Route path="/package/payment/:packageId" element={<ProtectedRoute requiredRole={["Seller", "Buyer"]}><PaymentPage /></ProtectedRoute>} />
          <Route path="/package/payment/success" element={<ProtectedRoute requiredRole={["Seller", "Buyer"]}><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/package/payment/failed" element={<PaymentFailed />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/payment" element={<ProtectedRoute requiredRole={["Seller", "Buyer"]}><PaymentPage /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute requiredRole={["Seller", "Buyer"]}><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/payment-status" element={<ProtectedRoute requiredRole={["Seller", "Buyer"]}><PaymentStatus /></ProtectedRoute>} />


          {/* Properties Routes (Buyer) */}
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/seller/:sellerId/properties" element={<SellerProperties />} />
          <Route path="/my-viewings" element={<ProtectedRoute><MyViewings /></ProtectedRoute>} />

          {/* Devices Routes - Requires Seller Role */}
          <Route path="/devices" element={<ProtectedRoute requiredRole="Seller"><Devices /></ProtectedRoute>} />
          <Route path="/device/:id" element={<ProtectedRoute requiredRole="Seller"><DeviceDetail /></ProtectedRoute>} />

          {/* Seller Routes - Requires Seller Role */}
          <Route path="/posts" element={<ProtectedRoute requiredRole={["Seller", "Buyer"]}><SellerPosts /></ProtectedRoute>} />
          <Route path="/post/create" element={<ProtectedRoute requiredRole="Seller"><CreatePost /></ProtectedRoute>} />
          <Route path="/post/edit/:id" element={<ProtectedRoute requiredRole="Seller"><CreatePost /></ProtectedRoute>} />
          <Route path="/house/create" element={<ProtectedRoute requiredRole="Seller"><CreateHouse /></ProtectedRoute>} />
          <Route path="/viewings" element={<ProtectedRoute requiredRole={["Seller","Admin"]}><ViewingManagement /></ProtectedRoute>} />
          <Route path="/myhome" element={<ProtectedRoute><MyHome /></ProtectedRoute>} />
          <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="Seller"><ModernDashboard /></ProtectedRoute>} />

          {/* Admin Routes - Requires Admin Role */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="Admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/posts" element={<ProtectedRoute requiredRole="Admin"><AdminPosts /></ProtectedRoute>} />
          <Route path="/admin/seller-requests" element={<ProtectedRoute requiredRole="Admin"><SellerRequests /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="Admin"><Analytics /></ProtectedRoute>} />
          <Route path="/admin/activities" element={<ProtectedRoute requiredRole="Admin"><Activities /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="Admin"><NotificationManager /></ProtectedRoute>} />
          <Route path="/admin/notifications/send" element={<ProtectedRoute requiredRole="Admin"><SendNotification /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute requiredRole="Admin"><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/viewings" element={<ProtectedRoute requiredRole="Admin"><AdminViewings /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Staff Routes */}
          <Route path="/staff/login" element={<StaffLoginRedirect />} />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute requiredRole="Staff">
                <StaffLayout>
                  <StaffDashboard />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/viewings"
            element={
              <ProtectedRoute requiredRole="Staff">
                <StaffLayout>
                  <StaffViewings />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/identity-verification"
            element={
              <ProtectedRoute requiredRole="Staff">
                <StaffLayout>
                  <ProductionIdentityVerification />
                </StaffLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect old admin path */}
          <Route path="/admin.html" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/request-upgrade" element={<RequestUpgrade />} />
                  <Route path="/my-upgrade-requests" element={<MyUpgradeRequests />} />
                  <Route path="/sign-contract/:requestId" element={<SignContract />} />

          {/* Removed duplicate route - already defined above */}

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      </BrowserRouter>
      </PackageProvider>
    </AuthProvider>
  );
}

// 404 Component
function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <h1 className="display-1 text-primary">404</h1>
      <h2 className="mb-4">Trang không tồn tại</h2>
      <a href="/" className="btn btn-primary">Về trang chủ</a>
    </div>
  );
}
