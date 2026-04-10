import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const IMAGES = [
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&q=80',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&q=80',
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&q=80',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&q=80',
];

const AMENITIES = [
  { icon: 'bi-lightning-charge-fill', label: 'EV Charging' },
  { icon: 'bi-camera-video-fill', label: 'CCTV' },
  { icon: 'bi-lightbulb-fill', label: 'Well Lit' },
  { icon: 'bi-key-fill', label: 'Keypad Entry' },
  { icon: 'bi-umbrella-fill', label: 'Covered' },
  { icon: 'bi-bus-front-fill', label: 'Near Transit' },
  { icon: 'bi-person-wheelchair', label: 'Accessible' },
  { icon: 'bi-clock-history', label: '24 / 7 Access' },
];

const REVIEWS = [
  { img: 'https://i.pravatar.cc/100?img=5', name: 'Marcus T.', date: 'February 2026', stars: 5, text: 'Absolutely perfect spot. Clean, secure, and the EV charger worked flawlessly. The keypad code was sent immediately after booking. Will definitely rebook.' },
  { img: 'https://i.pravatar.cc/100?img=9', name: 'Priya K.', date: 'January 2026', stars: 4.5, text: "Great location, two minutes from the rail station. Garage was spotless. Only minor gripe — the entrance is a little narrow, but my sedan fit fine." },
  { img: 'https://i.pravatar.cc/100?img=17', name: 'Jordan L.', date: 'December 2025', stars: 5, text: 'Saved me so much vs. the nearby pay lots. The host responded within minutes when I had a question. Highly recommend for anyone working downtown.' },
];

export default function Details() {
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState([
    { from: 'host', text: "Hey there! Thanks for checking out my listing. Feel free to ask anything about the space 🙂" }
  ]);

  function sendMsg(e) {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { from: 'me', text: chatMsg }]);
    setChatMsg('');
  }

  return (
    <>
      <main className="details-main">
        {/* Breadcrumb */}
        <div className="details-breadcrumb">
          <div className="container-xl">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/search">Search</Link></li>
                <li className="breadcrumb-item active">Private Garage — Capitol Hill</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="container-xl details-container">
          {/* GALLERY */}
          <div className="details-gallery">
            <div className="gallery-carousel">
              <button className="gallery-arrow gallery-arrow--prev" onClick={() => setActiveImg(i => (i - 1 + IMAGES.length) % IMAGES.length)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="gallery-arrow gallery-arrow--next" onClick={() => setActiveImg(i => (i + 1) % IMAGES.length)}>
                <i className="bi bi-chevron-right"></i>
              </button>
              <div className="gallery-16-9">
                <img src={IMAGES[activeImg]} alt="Private garage in Capitol Hill" />
              </div>
              <div className="gallery-dots">
                {IMAGES.map((_, i) => (
                  <button key={i} className={`gallery-dot${i === activeImg ? ' active' : ''}`} onClick={() => setActiveImg(i)}></button>
                ))}
              </div>
            </div>
            <div className="gallery-thumbs">
              {IMAGES.map((src, i) => (
                <div key={i} className={`gallery-thumb${i === activeImg ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                  <div className="gallery-thumb-16-9"><img src={src.replace('w=1200', 'w=300')} alt={`View ${i + 1}`} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* TWO-COLUMN */}
          <div className="details-body">
            {/* LEFT */}
            <div className="details-left">
              <div className="details-title-row">
                <div>
                  <h1 className="details-title">Private Garage — Capitol Hill</h1>
                  <div className="details-meta">
                    <span><i className="bi bi-geo-alt-fill"></i> 1421 10th Ave, Seattle, WA 98122</span>
                    <span className="details-meta-dot">·</span>
                    <span className="listing-tag" style={{ display: 'inline-block' }}>Garage</span>
                  </div>
                </div>
                <div className="details-rating-badge">
                  <i className="bi bi-star-fill"></i>
                  <span>4.9</span>
                  <small>(38 reviews)</small>
                </div>
              </div>

              <hr className="details-divider" />

              <div className="details-section">
                <h2 className="details-section-title">About this space</h2>
                <p className="details-description">
                  A private, fully covered garage located just two blocks from the Capitol Hill light rail station. Perfect for daily commuters and visitors. The space fits standard and mid-size SUVs comfortably. Access via keypad — code sent upon booking confirmation. Security cameras monitored 24/7.
                </p>
                <p className="details-description">
                  EV charging (Level 2, J1772) is available at no extra cost. Garage door height is 2.1 m — please check clearance if you drive a tall vehicle.
                </p>
              </div>

              <hr className="details-divider" />

              <div className="details-section">
                <h2 className="details-section-title">Amenities</h2>
                <div className="details-amenities">
                  {AMENITIES.map(a => (
                    <div className="amenity-item" key={a.label}>
                      <i className={`bi ${a.icon}`}></i>
                      <span>{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="details-divider" />

              <div className="details-section">
                <h2 className="details-section-title">Location</h2>
                <p className="details-description">Exact address provided after booking confirmation.</p>
                <div className="details-map" id="detailMap" style={{ background: 'var(--nexa-dark-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--nexa-gray-400)' }}><i className="bi bi-map me-2"></i>Map placeholder</span>
                </div>
              </div>

              <hr className="details-divider" />

              <div className="details-section">
                <h2 className="details-section-title">
                  Reviews
                  <span className="details-review-score">
                    <i className="bi bi-star-fill"></i> 4.9 &nbsp;·&nbsp; 38 reviews
                  </span>
                </h2>
                <div className="details-reviews">
                  {REVIEWS.map(r => (
                    <div className="review-card" key={r.name}>
                      <div className="review-header">
                        <img src={r.img} alt={r.name} className="review-avatar" />
                        <div className="review-author-info">
                          <span className="review-name">{r.name}</span>
                          <span className="review-date">{r.date}</span>
                        </div>
                        <div className="review-stars">
                          {[1,2,3,4,5].map(s => (
                            <i key={s} className={`bi ${s <= Math.floor(r.stars) ? 'bi-star-fill' : r.stars % 1 !== 0 && s === Math.ceil(r.stars) ? 'bi-star-half' : 'bi-star'}`}></i>
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="details-right">
              <div className="booking-card">
                <div className="booking-card-price">$5 <span>/ day</span></div>
                <div className="booking-card-rating">
                  <i className="bi bi-star-fill"></i> 4.9
                  <span className="booking-card-reviews">(38 reviews)</span>
                </div>
                <div className="booking-dates">
                  <div className="booking-date-field">
                    <label>Check-in</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="booking-date-sep"><i className="bi bi-arrow-right"></i></div>
                  <div className="booking-date-field">
                    <label>Check-out</label>
                    <input type="date" className="form-control" />
                  </div>
                </div>
                <button className="btn btn-nexa w-100 booking-btn" onClick={() => navigate('/booking')}>
                  <i className="bi bi-calendar-check me-2"></i>Reserve Now
                </button>
                <p className="booking-note">You won't be charged yet</p>
              </div>

              <div className="host-card">
                <div className="host-card-header">
                  <img src="https://i.pravatar.cc/100?img=33" alt="Host" className="host-avatar" />
                  <div className="host-info">
                    <span className="host-name">Daniel R.</span>
                    <span className="host-since">Host since 2023</span>
                    <div className="host-badges">
                      <span className="host-badge"><i className="bi bi-patch-check-fill"></i> Verified</span>
                      <span className="host-badge"><i className="bi bi-star-fill"></i> Top Host</span>
                    </div>
                  </div>
                </div>
                <div className="host-stats">
                  <div className="host-stat"><span className="host-stat-value">38</span><span className="host-stat-label">Reviews</span></div>
                  <div className="host-stat"><span className="host-stat-value">4.9</span><span className="host-stat-label">Rating</span></div>
                  <div className="host-stat"><span className="host-stat-value">&lt; 1hr</span><span className="host-stat-label">Response</span></div>
                </div>
                <p className="host-bio">Hi! I'm Daniel, a Capitol Hill local. I have two covered garage spots available and love helping commuters find affordable, secure parking.</p>
                <button className="btn btn-nexa-outline w-100 chat-btn" onClick={() => setShowChat(true)}>
                  <i className="bi bi-chat-dots-fill me-2"></i>Message Host
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CHAT MODAL */}
      {showChat && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content chat-modal-content">
              <div className="modal-header chat-modal-header">
                <div className="chat-modal-host">
                  <img src="https://i.pravatar.cc/100?img=33" alt="Host" className="chat-modal-avatar" />
                  <div>
                    <div className="chat-modal-name">Daniel R.</div>
                    <div className="chat-modal-status"><span className="chat-online-dot"></span> Usually responds in &lt; 1 hr</div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowChat(false)}></button>
              </div>
              <div className="modal-body chat-modal-body">
                <div className="chat-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`chat-bubble chat-bubble--${m.from === 'me' ? 'me' : 'host'}`}>
                      {m.from === 'host' && <img src="https://i.pravatar.cc/100?img=33" alt="Host" className="chat-bubble-avatar" />}
                      <div className="chat-bubble-text">{m.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer chat-modal-footer">
                <form className="chat-input-row w-100 d-flex gap-2" onSubmit={sendMsg}>
                  <input type="text" className="form-control chat-input" placeholder="Type a message…" value={chatMsg} onChange={e => setChatMsg(e.target.value)} />
                  <button type="submit" className="btn btn-nexa chat-send-btn"><i className="bi bi-send-fill"></i></button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
