import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LesseeSidebar from '../components/LesseeSidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BOOKINGS = [];

export default function Dashboard(user) {

  const [bookingStats, setBookingStats] = useState({ active: 0, past: 0 });
  const [conversations, setConversations] = useState({});
  const [threads, setThreads] = useState([]);
  const [bookings, setBookings] = useState(BOOKINGS);
  const navigate = useNavigate();

  async function setThreadInfo(fetchedUser) {
      const displayName = `${fetchedUser.firstName} ${fetchedUser.lastName[0]}.`;
      const imgURL = fetchedUser.profilePictureUrl || `https://i.pravatar.cc/48?u=${fetchedUser._id}`;
      const id = fetchedUser._id;
      const thread = { id, name: displayName, img: imgURL, time: '', preview: '', unread: false, listing: '' };
      setThreads(prev => prev.find(t => t.id === id) ? prev : [...prev, thread]);
      const threadMessages = fetchedUser.messages?.[user._id];
      const myRole = threadMessages?.role;
      console.log("role: ", myRole);
      setConversations(c => ({
        ...c,
        [id]: threadMessages?.messageHistory?.map(msg => ({ from: myRole === 'receiver' ? 'me' : 'them', text: msg, time: '' })) || [],
      }));
    }
  
    async function fetchUser(userid) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${userid}`, {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        console.log("error fetching user data for messages page:", error);
      }
    }
  
    async function fetchMessages() {
      const messages = user.messages;
      if (!messages) return;
  
      for (const userId in messages) {
        const fetchedUser = await fetchUser(userId);
        if (fetchedUser) await setThreadInfo(fetchedUser);
      }
      console.log("FETCHING USER MESSAGES");
    }
  
  useEffect(() => {
    fetchMessages(); // call immediately on mount
  
    const interval = setInterval(() => {
      fetchMessages();
      console.log("conversations: ", conversations);
  
    }, 5000); // every 5 seconds
  
    return () => clearInterval(interval); // cleanup on unmount
  
  }, []);

  function formatDates(start, end) {
    const options = { month: 'short', day: 'numeric' };
    const startDate = new Date(start).toLocaleDateString(undefined, options);
    const endDate = new Date(end).toLocaleDateString(undefined, options);
    return `${startDate} – ${endDate}`;
  }

  async function fetchListing(listingId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/parking-spaces/${listingId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log("error fetching listing data for dashboard:", error);
    }
  }

  async function fetchBookings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/me`, {
        withCredentials: true,
      });

      const fetchedBookings = response.data.map((booking) => {
        const listing = booking.parkingSpace;
        return {
          img: listing?.imageUrls?.[0] || '',
          name: listing?.title || '',
          dates: formatDates(booking.startDate, booking.endDate),
          price: `$${booking.totalAmount.toFixed(2)}`,
          status: booking.status,
          cls: `status-${booking.status}`,
          id: booking._id,
        };
      });

      setBookings(fetchedBookings);
      const active = fetchedBookings.filter(b => b.status === 'active').length;
      const past = fetchedBookings.filter(b => b.status === 'completed').length;
      setBookingStats({ active, past });
      console.log("successfully fetched bookings data for dashboard:", fetchedBookings);
    } catch (error) {
      console.log("error fetching bookings:", error);
    }
  }

  function calculateBookingStats() {
    const active = bookings.filter(b => b.status === 'active').length;
    const past = bookings.filter(b => b.status === 'completed').length;
    setBookingStats({ active, past });
  }

  useEffect(() => {
    fetchBookings();
  },[]);

  return (
    <div className="dash-page">
      <div className="dash-layout">
        <LesseeSidebar {...user} />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">Good morning, {user.firstName} 👋</h1>
              <p className="dash-page-sub">Here's what's happening with your parking.</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="dash-stat-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--nexa-primary)' }}>
                <i className="bi bi-calendar2-check-fill"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">{bookingStats.active}</div>
                <div className="dash-stat-label">Active Bookings</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(0,210,255,0.12)', color: 'var(--nexa-accent)' }}>
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">{bookingStats.past}</div> 
                <div className="dash-stat-label">Past Bookings</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(0,217,126,0.12)', color: '#00d97e' }}>
                <i className="bi bi-chat-dots-fill"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">{threads.filter(t => t.unread).length}</div>
                <div className="dash-stat-label">Unread Messages</div>
              </div>
            </div>
          </div>

          {/* Two-column */}
          <div className="dash-two-col">
            {/* Recent bookings */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Recent Bookings</h2>
                <Link to="/my-bookings" className="dash-card-link">View all</Link>
              </div>
              <div className="dash-booking-list">
                {bookings.map((b, i) => (
                  // <Link to={`/booking-details/${b.id}`} className="dash-booking-item" key={i}>
                  <div className="dash-booking-item" key={b.id || i} onClick={() => navigate(`/booking-details/?bookingId=${b.id}`)} style={{ cursor: 'pointer' }}>                    <img src={b.img} alt="" className="dash-booking-thumb" />
                    <div className="dash-booking-info">
                      <div className="dash-booking-name">{b.name}</div>
                      <div className="dash-booking-dates"><i className="bi bi-calendar3"></i> {b.dates}</div>
                      <div className="dash-booking-price">{b.price}</div>
                    </div>
                    <span className={`dash-booking-status ${b.cls}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="dash-col-right">
              {/* Messages */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Messages</h2>
                  <Link to="/messages" className="dash-card-link">View all</Link>
                </div>
                <div className="dash-msg-list">
                  {threads.map((m, i) => (
                      <Link to="/messages" className={`dash-msg-item${m.unread ? ' dash-msg-unread' : ''}`} key={i}>
                        <img src={m.img} alt="" className="dash-msg-avatar" />
                        <div className="dash-msg-body">
                          <div className="dash-msg-name">{m.name} <span className="dash-msg-time">{m.time}</span></div>
                          <div className="dash-msg-preview">{m.preview}</div>
                        </div>
                      </Link>
                    ))
                  }
                </div>
              </div>

              {/* Quick actions */}
              <div className="dash-card">
                <h2 className="dash-card-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
                <div className="dash-quick-actions">
                  <Link to="/search" className="dash-quick-btn"><i className="bi bi-search"></i> Find Parking</Link>
                  <Link to="/my-bookings" className="dash-quick-btn"><i className="bi bi-calendar2-check"></i> My Bookings</Link>
                  <Link to="/messages" className="dash-quick-btn"><i className="bi bi-chat-dots"></i> Messages</Link>
                  <Link to="/favorites" className="dash-quick-btn"><i className="bi bi-heart-fill"></i> Favorites</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
