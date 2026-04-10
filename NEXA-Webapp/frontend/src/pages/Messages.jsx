import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LesseeSidebar from '../components/LesseeSidebar';

const THREADS = [
  { id: 'marcus', img: 'https://i.pravatar.cc/48?img=12', name: 'Marcus T.', time: '2h ago', preview: 'Hey! The gate code is 4821…', unread: true, listing: 'Private Garage · Capitol Hill' },
  { id: 'sarah', img: 'https://i.pravatar.cc/48?img=5', name: 'Sarah K.', time: 'Yesterday', preview: 'Your spot is ready! Pull all the way in to…', unread: true, listing: 'Covered Driveway · Fremont' },
  { id: 'james', img: 'https://i.pravatar.cc/48?img=21', name: 'James R.', time: 'Mon', preview: 'Thanks for booking! See you on the 9th.', unread: false, listing: 'Outdoor Lot · Belltown' },
];

const INITIAL_MESSAGES = {
  marcus: [
    { from: 'them', img: 'https://i.pravatar.cc/32?img=12', text: 'Hi Alex! I saw your booking — welcome. The garage is around back. Let me know if you need anything.', time: '10:12 AM', date: 'Jun 8, 2025' },
    { from: 'me', text: 'Thanks Marcus! Quick question — is there a height restriction?', time: '10:35 AM' },
    { from: 'them', img: 'https://i.pravatar.cc/32?img=12', text: 'Good question! Max clearance is 7 ft. Most sedans and SUVs fit fine.', time: '10:41 AM', date: null },
    { from: 'them', img: 'https://i.pravatar.cc/32?img=12', text: 'Hey! The gate code is 4821. Let me know when you arrive and I\'ll make sure everything is ready.', time: '8:02 AM', date: 'Jun 9, 2025' },
    { from: 'me', text: 'Perfect, heading over now. Thanks!', time: '8:47 AM' },
  ],
  sarah: [
    { from: 'them', img: 'https://i.pravatar.cc/32?img=5', text: 'Your spot is ready! Pull all the way in to the back.', time: 'Yesterday', date: null },
  ],
  james: [
    { from: 'them', img: 'https://i.pravatar.cc/32?img=21', text: 'Thanks for booking! See you on the 9th.', time: 'Mon', date: null },
  ],
};

export default function Messages() {
  const [activeThread, setActiveThread] = useState('marcus');
  const [conversations, setConversations] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const thread = THREADS.find(t => t.id === activeThread);
  const messages = conversations[activeThread] || [];

  function send(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setConversations(c => ({
      ...c,
      [activeThread]: [...(c[activeThread] || []), { from: 'me', text: input, time: 'Just now' }],
    }));
    setInput('');
  }

  return (
    <div className="dash-page">
      <div className="dash-layout">
        <LesseeSidebar />
        <main className="dash-main dash-main--flush">
          <div className="chat-layout">
            {/* Thread list */}
            <div className="chat-threads">
              <div className="chat-threads-header">
                <span className="dash-page-title" style={{ fontSize: '1.15rem' }}>Messages</span>
              </div>
              {THREADS.map(t => (
                <div key={t.id} className={`chat-thread${activeThread === t.id ? ' active' : ''}`} onClick={() => setActiveThread(t.id)}>
                  <img src={t.img} alt="" className="chat-thread-avatar" />
                  <div className="chat-thread-body">
                    <div className="chat-thread-top">
                      <span className="chat-thread-name">{t.name}</span>
                      <span className="chat-thread-time">{t.time}</span>
                    </div>
                    <div className="chat-thread-preview">{t.preview}</div>
                  </div>
                  {t.unread && <span className="chat-thread-dot"></span>}
                </div>
              ))}
            </div>

            {/* Chat window */}
            <div className="chat-window">
              <div className="chat-win-header">
                <img src={thread?.img} alt="" className="chat-win-avatar" />
                <div className="chat-win-host-info">
                  <div className="chat-win-name">{thread?.name}</div>
                  <div className="chat-win-listing">{thread?.listing}</div>
                </div>
                <Link to="/booking-details" className="btn btn-nexa-outline btn-nexa-sm ms-auto">
                  <i className="bi bi-calendar2-check me-1"></i> View Booking
                </Link>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
