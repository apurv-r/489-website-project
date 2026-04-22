// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Details from "./pages/Details";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";

// Lessee (driver) pages
import Dashboard from "./pages/Dashboard";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";

// Host pages
import HostDashboard from "./pages/host/HostDashboard";
import HostMyListings from "./pages/host/HostMyListings";
import HostCreateListing from "./pages/host/HostCreateListing";
import HostListingDetails from "./pages/host/HostListingDetails";
import HostEditListing from "./pages/host/HostEditListing";
import HostBookings from "./pages/host/HostBookings";
import HostBookingDetails from "./pages/host/HostBookingDetails";
import HostEarnings from "./pages/host/HostEarnings";
import HostMessages from "./pages/host/HostMessages";
import HostSettings from "./pages/host/HostSettings";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminListings from "./pages/admin/AdminListings";
import AdminVerificationQueue from "./pages/admin/AdminVerificationQueue";
import AdminHostVerification from "./pages/admin/AdminHostVerification";
import AdminListingReview from "./pages/admin/AdminListingReview";
import AdminReports from "./pages/admin/AdminReports";
import AdminReportReview from "./pages/admin/AdminReportReview";
import AdminSettings from "./pages/admin/AdminSettings";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function RequireAuth({ user, loading, children }) {
  if (loading) return null;
  if (!user?._id) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      });
      const user = response.data.user;
      setUser(user);
      console.log("successfully fetched user data for dashboard: ", user);
    } catch (error) {
      setUser({});
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    window.addEventListener('auth-changed', fetchUser);
    return () => window.removeEventListener('auth-changed', fetchUser);
  }, []);

  return (
    <BrowserRouter>
      <header>
        <Navbar />
      </header>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search {...user} />} />
        <Route path="/details" element={<Details {...user} />} />
        <Route path="/booking" element={<Booking {...user} />} />
        <Route path="/confirmation" element={<Confirmation />} />

        {/* Lessee */}
        <Route path="/dashboard" element={<RequireAuth user={user} loading={loading}><Dashboard {...user} /></RequireAuth>} />
        <Route path="/my-bookings" element={<RequireAuth user={user} loading={loading}><MyBookings {...user} /></RequireAuth>} />
        <Route path="/booking-details" element={<RequireAuth user={user} loading={loading}><BookingDetails {...user} /></RequireAuth>} />
        <Route path="/favorites" element={<RequireAuth user={user} loading={loading}><Favorites {...user} /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth user={user} loading={loading}><Messages {...user} /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth user={user} loading={loading}><Settings /></RequireAuth>} />

        {/* Host */}
        <Route path="/host/dashboard" element={<RequireAuth user={user} loading={loading}><HostDashboard /></RequireAuth>} />
        <Route path="/host/my-listings" element={<RequireAuth user={user} loading={loading}><HostMyListings /></RequireAuth>} />
        <Route path="/host/create-listing" element={<RequireAuth user={user} loading={loading}><HostCreateListing /></RequireAuth>} />
        <Route path="/host/listing-details" element={<RequireAuth user={user} loading={loading}><HostListingDetails /></RequireAuth>} />
        <Route path="/host/edit-listing" element={<RequireAuth user={user} loading={loading}><HostEditListing /></RequireAuth>} />
        <Route path="/host/bookings" element={<RequireAuth user={user} loading={loading}><HostBookings /></RequireAuth>} />
        <Route path="/host/booking-details" element={<RequireAuth user={user} loading={loading}><HostBookingDetails /></RequireAuth>} />
        <Route path="/host/earnings" element={<RequireAuth user={user} loading={loading}><HostEarnings /></RequireAuth>} />
        <Route path="/host/messages" element={<RequireAuth user={user} loading={loading}><HostMessages {...user} /></RequireAuth>} />
        <Route path="/host/settings" element={<RequireAuth user={user} loading={loading}><HostSettings /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/user-detail" element={<AdminUserDetail />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/verification-queue" element={<AdminVerificationQueue />} />
        <Route path="/admin/host-verification" element={<AdminHostVerification />} />
        <Route path="/admin/listing-review" element={<AdminListingReview />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/report-review" element={<AdminReportReview />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </BrowserRouter>
  );
}
