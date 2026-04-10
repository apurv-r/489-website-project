// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Details from './pages/Details';
import Booking from './pages/Booking';
import Confirmation from './pages/Confirmation';

// Lessee (driver) pages
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';

// Host pages
import HostDashboard from './pages/host/HostDashboard';
import HostMyListings from './pages/host/HostMyListings';
import HostCreateListing from './pages/host/HostCreateListing';
import HostListingDetails from './pages/host/HostListingDetails';
import HostEditListing from './pages/host/HostEditListing';
import HostBookings from './pages/host/HostBookings';
import HostBookingDetails from './pages/host/HostBookingDetails';
import HostEarnings from './pages/host/HostEarnings';
import HostAvailability from './pages/host/HostAvailability';
import HostMessages from './pages/host/HostMessages';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminVerificationQueue from './pages/admin/AdminVerificationQueue';
import AdminListingReview from './pages/admin/AdminListingReview';
import AdminReports from './pages/admin/AdminReports';
import AdminReportReview from './pages/admin/AdminReportReview';
import AdminSettings from './pages/admin/AdminSettings';
import LesseeSidebar from './components/LesseeSidebar';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from "axios"
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {

  const [user, setUser] = useState({});

  // consider moving this to App.js and passing user as prop to avoid multiple calls to /me endpoint across different pages
  const fetchUser = async () => {

    await axios.get(`${API_BASE_URL}/api/auth/me`, {
      withCredentials: true,
    })
    .then( async response => {
      const user = response.data.user;
      setUser(user);
      console.log("successfully fetched user data for dashboard:", user);
    })
    .catch(error => {
      console.log(error);
    });
  }

  useEffect(() => {
    fetchUser();  
  },[]);

  return (
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/details" element={<Details />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/confirmation" element={<Confirmation />} />

        {/* Lessee */}
        <Route path="/dashboard" element={<Dashboard {...user} />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/booking-details" element={<BookingDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/messages" element={<Messages />} />

        {/* Host */}
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/host/my-listings" element={<HostMyListings />} />
        <Route path="/host/create-listing" element={<HostCreateListing />} />
        <Route path="/host/listing-details" element={<HostListingDetails />} />
        <Route path="/host/edit-listing" element={<HostEditListing />} />
        <Route path="/host/bookings" element={<HostBookings />} />
        <Route path="/host/booking-details" element={<HostBookingDetails />} />
        <Route path="/host/earnings" element={<HostEarnings />} />
        <Route path="/host/availability" element={<HostAvailability />} />
        <Route path="/host/messages" element={<HostMessages />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/user-detail" element={<AdminUserDetail />} />
        <Route path="/admin/verification-queue" element={<AdminVerificationQueue />} />
        <Route path="/admin/listing-review" element={<AdminListingReview />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/report-review" element={<AdminReportReview />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </BrowserRouter>
  );
}
