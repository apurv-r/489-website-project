import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const THREADS = [
  {
    id: 'marcus',
    name: 'Marcus T.',
    avatar: 'M',
    listing: 'Capitol Hill Garage',
    lastMsg: 'Got it, thanks! See you on the 2nd.',
    time: '10:32 AM',
    unread: 0,
    messages: [
      { from: 'them', text: 'Hi! Quick question — is the garage accessible 24/7?', time: '9:45 AM' },
      { from: 'me', text: "Yes, absolutely! You'll get a keycard code after booking. Works around the clock.", time: '9:50 AM' },
      { from: 'them', text: 'Perfect. And is there EV charging available?', time: '9:52 AM' },
      { from: 'me', text: 'Yep, there are two Level 2 chargers in spots 4 and 5. Just let me know if you need one reserved.', time: '9:55 AM' },
      { from: 'them', text: 'Got it, thanks! See you on the 2nd.', time: '10:32 AM' },
    ],
  },
  {
    id: 'sarah',
    name: 'Sarah K.',
    avatar: 'S',
    listing: 'Capitol Hill Garage',
    lastMsg: 'Can I extend my booking by 2 days?',
    time: 'Yesterday',
    unread: 1,
    messages: [
      { from: 'them', text: 'Hey! I\'d like to extend my booking by 2 extra days if possible. Jun 15–17?', time: 'Yesterday 3:10 PM' },
    ],
  },
  {
    id: 'james',
    name: 'James R.',
    avatar: 'J',
    listing: 'Eastlake Driveway',
    lastMsg: 'All good, spot was great!',
    time: 'May 26',
    unread: 0,
    messages: [
      { from: 'them', text: 'Hi, just checked out. All good, spot was great!', time: 'May 26 11:00 AM' },
      { from: 'me', text: 'So glad to hear it! Thanks for being a great guest.', time: 'May 26 11:15 AM' },
    ],
  },
];

export default function HostMessages() {
  const [activeId, setActiveId] = useState('marcus');
  const [convs, setConvs] = useState(() => {
    const m = {};
    THREADS.forEach(t => { m[t.id] = t.messages; });
    return m;
  });
  const [input, setInput] = useState('');

  const thread = THREADS.find(t => t.id === activeId);

  function sendMsg() {
    const text = input.trim();
    if (!text) return;
    setConvs(prev => ({
      ...prev,
      [activeId]: [...prev[activeId], { from: 'me', text, time: 'Just now' }],
    }));
    setInput('');
  }

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-page-header">
            <h1 className="dash-page-title">Messages</h1>
            <p className="dash-page-sub">Communicate with your guests.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
            {/* Thread list */}
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--nexa-border)', fontWeight: 700, fontSize: '0.9rem' }}>Conversations</div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {THREADS.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    style={{
                      padding: '0.85rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--nexa-border)',
                      background: activeId === t.id ? 'var(--nexa-surface-2)' : 'transparent',
                      borderLeft: activeId === t.id ? '3px solid var(--nexa-lsr)' : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--nexa-lsr)', color: '#0a0a0f', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--nexa-gray-500)' }}>{t.time}</span>
                        </div>
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--nexa-gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.listing}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--nexa-gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{t.lastMsg}</p>
                          {t.unread > 0 && <span style={{ background: 'var(--nexa-lsr)', color: '#0a0a0f', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.unread}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat pane */}
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 500 }}>
              {/* Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--nexa-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{thread.name}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--nexa-gray-500)' }}>{thread.listing}</p>
                </div>
                <Link to="/host/booking-details" className="btn btn-nexa-outline btn-nexa-sm">
                  <i className="bi bi-calendar3 me-1"></i> View Booking
                </Link>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {convs[activeId].map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%', padding: '0.6rem 1rem', borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.from === 'me' ? 'var(--nexa-lsr)' : 'var(--nexa-surface-2)',
                      color: msg.from === 'me' ? '#0a0a0f' : 'var(--nexa-gray-200)',
                      fontSize: '0.875rem', lineHeight: 1.5,
                    }}>
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', opacity: 0.6 }}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--nexa-border)', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="lsr-input"
                  style={{ flex: 1 }}
                  placeholder="Type a message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                />
                <button className="btn btn-nexa" onClick={sendMsg}><i className="bi bi-send-fill"></i></button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
