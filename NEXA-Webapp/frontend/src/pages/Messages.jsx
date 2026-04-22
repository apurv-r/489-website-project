import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LesseeSidebar from '../components/LesseeSidebar';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// used for preview
const THREADS = [
  { id: 'marcus', img: 'https://i.pravatar.cc/48?img=12', name: 'Marcus T.', time: '2h ago', preview: 'Hey! The gate code is 4821…', unread: true, listing: 'Private Garage · Capitol Hill' },
  { id: 'sarah', img: 'https://i.pravatar.cc/48?img=5', name: 'Sarah K.', time: 'Yesterday', preview: 'Your spot is ready! Pull all the way in to…', unread: true, listing: 'Covered Driveway · Fremont' },
  { id: 'james', img: 'https://i.pravatar.cc/48?img=21', name: 'James R.', time: 'Mon', preview: 'Thanks for booking! See you on the 9th.', unread: false, listing: 'Outdoor Lot · Belltown' },
];

const INITIAL_MESSAGES = {
  // marcus: [
  //   { from: 'them', img: 'https://i.pravatar.cc/32?img=12', text: 'Hi Alex! I saw your booking — welcome. The garage is around back. Let me know if you need anything.', time: '10:12 AM', date: 'Jun 8, 2025' },
  //   { from: 'me', text: 'Thanks Marcus! Quick question — is there a height restriction?', time: '10:35 AM' },
  //   { from: 'them', img: 'https://i.pravatar.cc/32?img=12', text: 'Good question! Max clearance is 7 ft. Most sedans and SUVs fit fine.', time: '10:41 AM', date: null },
  //   { from: 'them', img: 'https://i.pravatar.cc/32?img=12', text: 'Hey! The gate code is 4821. Let me know when you arrive and I\'ll make sure everything is ready.', time: '8:02 AM', date: 'Jun 9, 2025' },
  //   { from: 'me', text: 'Perfect, heading over now. Thanks!', time: '8:47 AM' },
  // ],
  // sarah: [
  //   { from: 'them', img: 'https://i.pravatar.cc/32?img=5', text: 'Your spot is ready! Pull all the way in to the back.', time: 'Yesterday', date: null },
  // ],
  // james: [
  //   { from: 'them', img: 'https://i.pravatar.cc/32?img=21', text: 'Thanks for booking! See you on the 9th.', time: 'Mon', date: null },
  // ],
};

export default function Messages(user) {
  const [searchParams] = useSearchParams();
  const toParam = searchParams.get('to');
  const [activeThread, setActiveThread] = useState('');
  const [conversations, setConversations] = useState(INITIAL_MESSAGES);
  const [threads, setThreads] = useState([]);
  const [readUpTo, setReadUpTo] = useState({});
  const [input, setInput] = useState('');

  const thread = threads.find(t => t.id === activeThread);
  const messages = conversations[activeThread] || [];

  // Mark active thread as read whenever it's opened or new messages arrive
  useEffect(() => {
    if (!activeThread) return;
    const receivedCount = (conversations[activeThread] || []).filter(m => m.from === 'them').length;
    setReadUpTo(prev => ({ ...prev, [activeThread]: receivedCount }));
  }, [activeThread, conversations]);

  async function send(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setConversations(c => ({
      ...c,
      [activeThread]: [...(c[activeThread] || []), { from: 'me', text: input, time: 'Just now' }],
    }));

    // put message to backend
    await axios.put(`${API_BASE_URL}/api/users/message/${user._id}/${activeThread}`,
      { text: input },
      { withCredentials: true })
    .then(response => {
      console.log("successfully sent message: ", response.data);
    })
    .catch(error => {
      console.log("error sending message: ", error);
    });
    setInput('');
  }

  async function setThreadInfo(fetchedUser) {
    const displayName = `${fetchedUser.firstName} ${fetchedUser.lastName[0]}.`;
    const imgURL = fetchedUser.profilePictureUrl || `https://i.pravatar.cc/48?u=${fetchedUser._id}`;
    const id = fetchedUser._id;
    const thread = { id, name: displayName, img: imgURL, time: '', preview: '', unread: false, listing: '' };
    setThreads(prev => prev.find(t => t.id === id) ? prev : [...prev, thread]);
    const threadMessages = fetchedUser.messages?.[user._id];
    setConversations(c => ({
      ...c,
      [id]: threadMessages?.messageHistory?.map(msg => ({
        from: msg.senderId === user._id ? 'me' : 'them',
        text: msg.text,
        time: '',
      })) || [],
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
    try {
      // Fetch fresh user data so newly created threads are included
      const meRes = await axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true });
      const freshUser = meRes.data.user;
      const messages = freshUser?.messages;
      if (!messages) return;
      for (const userId in messages) {
        const fetchedUser = await fetchUser(userId);
        if (fetchedUser) await setThreadInfo(fetchedUser);
      }
    } catch (error) {
      console.log('error fetching messages:', error);
    }
  }

  // Auto-select thread specified by ?to= query param once threads load
  useEffect(() => {
    if (toParam && threads.find(t => t.id === toParam)) {
      setActiveThread(toParam);
    }
  }, [toParam, threads]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dash-page">
      <div className="dash-layout">
        <LesseeSidebar {...user}/>
        <main className="dash-main dash-main--flush">
          <div className="chat-layout">
            {/* Thread list */}
            <div className="chat-threads">
              <div className="chat-threads-header">
                <span className="dash-page-title" style={{ fontSize: '1.15rem' }}>Messages</span>
              </div>
              {threads.map(t => {
                const receivedCount = (conversations[t.id] || []).filter(m => m.from === 'them').length;
                const isUnread = receivedCount > (readUpTo[t.id] || 0);
                const preview = (conversations[t.id] || []).slice(-1)[0]?.text || '';
                return (
                  <div key={t.id} className={`chat-thread${activeThread === t.id ? ' active' : ''}`} onClick={() => setActiveThread(t.id)}>
                    <img src={t.img} alt="" className="chat-thread-avatar" />
                    <div className="chat-thread-body">
                      <div className="chat-thread-top">
                        <span className={`chat-thread-name${isUnread ? ' fw-bold' : ''}`}>{t.name}</span>
                        <span className="chat-thread-time">{t.time}</span>
                      </div>
                      <div className={`chat-thread-preview${isUnread ? ' fw-semibold' : ''}`}>{preview || t.preview}</div>
                    </div>
                    {isUnread && <span className="chat-thread-dot"></span>}
                  </div>
                );
              })}
            </div>

            {/* Chat window */}
            <div className="chat-window">
              {!activeThread ? (
                <div className="chat-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: '0.95rem' }}>
                  Select a conversation to start messaging
                </div>
              ) : (
                <>
                  <div className="chat-win-header">
                    <img src={thread?.img} alt="" className="chat-win-avatar" />
                    <div className="chat-win-host-info">
                      <div className="chat-win-name">{thread?.name}</div>
                      <div className="chat-win-listing">{thread?.listing}</div>
                    </div>
                    {/* <Link to="/booking-details" className="btn btn-nexa-outline btn-nexa-sm ms-auto">
                      <i className="bi bi-calendar2-check me-1"></i> View Booking
                    </Link> */}
                  </div>

                  <div className="chat-messages">
                    {messages.map((m, i) => (
                      <div key={i}>
                        {m.date && <div className="chat-date-sep"><span>{m.date}</span></div>}
                        <div className={`chat-bubble chat-bubble--${m.from === 'me' ? 'me' : 'them'}`}>
                          {m.from !== 'me' && <img src={m.img} alt="" className="chat-bubble-avatar" />}
                          <div className="chat-bubble-wrap">
                            <div className="chat-bubble-msg">{m.text}</div>
                            <div className="chat-bubble-time">{m.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="chat-input-bar">
                    <form className="d-flex gap-2 w-100" onSubmit={send}>
                      <input type="text" className="form-control chat-input" placeholder="Type a message…" value={input} onChange={e => setInput(e.target.value)} />
                      <button type="submit" className="btn btn-nexa chat-send-btn"><i className="bi bi-send-fill"></i></button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
