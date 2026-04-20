import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function HostMessages(user) {
  const [activeId, setActiveId] = useState('');
  const [threads, setThreads] = useState([]);
  const [convs, setConvs] = useState({});
  const [readUpTo, setReadUpTo] = useState({});
  const [input, setInput] = useState('');

  const thread = threads.find(t => t.id === activeId);
  const messages = convs[activeId] || [];

  useEffect(() => {
    if (!activeId) return;
    const receivedCount = (convs[activeId] || []).filter(m => m.from === 'them').length;
    setReadUpTo(prev => ({ ...prev, [activeId]: receivedCount }));
  }, [activeId, convs]);

  async function sendMsg() {
    const text = input.trim();
    if (!text || !activeId) return;
    setConvs(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { from: 'me', text, time: 'Just now' }],
    }));
    setInput('');
    await axios.put(
      `${API_BASE_URL}/api/users/message/${user._id}/${activeId}`,
      { text },
      { withCredentials: true },
    ).then(response => {
      console.log('successfully sent message:', response.data);
    }).catch(error => {
      console.log('error sending message:', error);
    });
  }

  async function fetchUser(userid) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${userid}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log('error fetching user data for host messages:', error);
    }
  }

  async function setThreadInfo(fetchedUser) {
    const displayName = `${fetchedUser.firstName} ${fetchedUser.lastName[0]}.`;
    const imgURL = fetchedUser.profilePictureUrl || `https://i.pravatar.cc/48?u=${fetchedUser._id}`;
    const id = fetchedUser._id;
    const avatarLetter = fetchedUser.firstName[0].toUpperCase();
    const threadObj = { id, name: displayName, img: imgURL, avatar: avatarLetter, time: '', listing: '' };
    setThreads(prev => prev.find(t => t.id === id) ? prev : [...prev, threadObj]);
    const threadMessages = fetchedUser.messages?.[user._id];
    setConvs(c => ({
      ...c,
      [id]: threadMessages?.messageHistory?.map(msg => ({
        from: msg.senderId === user._id ? 'me' : 'them',
        text: msg.text,
        time: '',
      })) || [],
    }));
  }

  async function fetchMessages() {
    const userMessages = user.messages;
    if (!userMessages) return;
    for (const userId in userMessages) {
      const fetchedUser = await fetchUser(userId);
      if (fetchedUser) await setThreadInfo(fetchedUser);
    }
    console.log('fetched host messages');
  }

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                {threads.map(t => {
                  const receivedCount = (convs[t.id] || []).filter(m => m.from === 'them').length;
                  const isUnread = receivedCount > (readUpTo[t.id] || 0);
                  const preview = (convs[t.id] || []).slice(-1)[0]?.text || '';
                  return (
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
                            <span style={{ fontWeight: isUnread ? 700 : 600, fontSize: '0.875rem' }}>{t.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--nexa-gray-500)' }}>{t.time}</span>
                          </div>
                          <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--nexa-gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.listing}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--nexa-gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{preview}</p>
                            {isUnread && <span style={{ background: 'var(--nexa-lsr)', color: '#0a0a0f', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat pane */}
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 500 }}>
              {!activeId ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: '0.95rem' }}>
                  Select a conversation to start messaging
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--nexa-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{thread?.name}</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--nexa-gray-500)' }}>{thread?.listing}</p>
                    </div>
                    <Link to="/host/booking-details" className="btn btn-nexa-outline btn-nexa-sm">
                      <i className="bi bi-calendar3 me-1"></i> View Booking
                    </Link>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {messages.map((msg, i) => (
                      <div key={i} className={`chat-bubble chat-bubble--${msg.from === 'me' ? 'me' : 'them'}`}>
                        {msg.from !== 'me' && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--nexa-host)', color: '#0a0a0f', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                            {thread?.avatar}
                          </div>
                        )}
                        <div className="chat-bubble-wrap">
                          <div className="chat-bubble-msg" style={msg.from === 'me' ? { background: 'var(--nexa-host)', color: '#0a0a0f' } : {}}>
                            {msg.text}
                          </div>
                          {msg.time && <div className="chat-bubble-time">{msg.time}</div>}
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
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
