import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    navigate('/search');
  }

  return (
    <>
      <Navbar variant="public" />

      {/* HERO */}
      <section className="hero-section" id="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1400&q=80" alt="Aerial city parking" />
        </div>
        <div className="container hero-content text-center">
          <div className="hero-badge animate-fade-up">
            <i className="bi bi-lightning-charge-fill"></i> The smarter way to park
          </div>
          <h1 className="hero-title animate-fade-up delay-1">
            Find <span className="text-gradient">Parking</span> Near You
          </h1>
          <p className="hero-subtitle mx-auto animate-fade-up delay-2">
            Search hundreds of affordable driveways, garages, and lots listed by local homeowners &amp; businesses.
          </p>

          <div className="search-bar-wrapper animate-fade-up delay-3">
            <form className="search-bar-form" onSubmit={handleSearch}>
              <div className="search-bar-field search-bar-field--location">
                <label className="search-label"><i className="bi bi-geo-alt-fill me-1"></i>Location</label>
                <div className="position-relative">
                  <i className="bi bi-geo-alt search-input-icon"></i>
                  <input type="text" className="form-control form-control-lg" style={{ paddingLeft: 44 }} placeholder="City, address, or ZIP…" />
                </div>
              </div>
              <div className="search-bar-field search-bar-field--dates">
                <label className="search-label"><i className="bi bi-calendar-event me-1"></i>Dates</label>
                <div className="search-date-range search-date-range--hero">
                  <input type="date" className="form-control form-control-lg" />
                  <span className="date-separator">→</span>
                  <input type="date" className="form-control form-control-lg" />
                </div>
              </div>
              <div className="search-bar-field search-bar-field--btn">
                <button type="submit" className="btn btn-nexa btn-nexa-lg w-100">
                  <i className="bi bi-search me-1"></i> Search
                </button>
              </div>
            </form>
          </div>

          <div className="search-hints mt-4 animate-fade-up delay-4">
            <span className="search-hint"><i className="bi bi-fire me-1"></i>Popular:</span>
            <button type="button" className="search-hint-link btn btn-link p-0" onClick={() => navigate('/search')}>Seattle, WA</button>
            <button type="button" className="search-hint-link btn btn-link p-0" onClick={() => navigate('/search')}>Portland, OR</button>
            <button type="button" className="search-hint-link btn btn-link p-0" onClick={() => navigate('/search')}>San Francisco, CA</button>
            <button type="button" className="search-hint-link btn btn-link p-0" onClick={() => navigate('/search')}>Bellevue, WA</button>
          </div>

          <div className="hero-stats justify-content-center animate-fade-up delay-4">
            <div className="hero-stat"><h3 className="text-gradient">500+</h3><p>Parking Spots</p></div>
            <div className="hero-stat"><h3 className="text-gradient">1,200+</h3><p>Happy Drivers</p></div>
            <div className="hero-stat"><h3 className="text-gradient">50+</h3><p>Cities Covered</p></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-padding" id="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag"><i className="bi bi-gear"></i> How It Works</span>
            <h2>Park in <span className="text-gradient">Three Easy Steps</span></h2>
            <p>Whether you're looking for a spot or listing one, NEXA makes the process seamless.</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="text-center step-connector">
                <div className="step-number">1</div>
                <h5>Search &amp; Discover</h5>
                <p className="text-secondary px-2">Enter your destination and browse available parking spaces near you on our interactive map. Filter by distance, price, and type.</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="text-center step-connector">
                <div className="step-number">2</div>
                <h5>Book &amp; Pay</h5>
                <p className="text-secondary px-2">Found the perfect spot? Reserve it instantly. Secure payments and confirmation — all handled through the platform.</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="text-center">
                <div className="step-number">3</div>
                <h5>Park &amp; Go</h5>
                <p className="text-secondary px-2">Follow the directions to your reserved space, park your vehicle, and enjoy your day — hassle-free.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="section-padding bg-dark-light" id="listings">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag"><i className="bi bi-star"></i> Featured Listings</span>
            <h2>Popular <span className="text-gradient">Parking Spots</span></h2>
            <p>Hand-picked spaces loved by our community of drivers.</p>
          </div>
          <div className="row g-4">
            {[
              { img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=500&q=80', badge: 'Featured', title: 'Private Garage — Capitol Hill', location: 'Seattle, WA', tags: ['Garage', 'Covered', '24/7 Access'], price: '$18', rating: '4.9', reviews: 42 },
              { img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&q=80', badge: 'Popular', title: 'Spacious Driveway — Belltown', location: 'Seattle, WA', tags: ['Driveway', 'Easy Access'], price: '$12', rating: '4.7', reviews: 28 },
              { img: 'https://images.unsplash.com/photo-1621929747188-0b4dc28498d6?w=500&q=80', badge: 'New', title: 'Open Lot — University District', location: 'Seattle, WA', tags: ['Open Lot', 'Budget', 'Near Transit'], price: '$8', rating: '4.5', reviews: 15 },
            ].map((card, i) => (
              <div className="col-lg-4 col-md-6" key={i}>
                <div className="listing-card" onClick={() => navigate('/details')} style={{ cursor: 'pointer' }}>
                  <div className="listing-img">
                    <img src={card.img} alt={card.title} />
                    <span className="listing-badge">{card.badge}</span>
                    <button className="listing-save" aria-label="Save listing" onClick={e => e.stopPropagation()}>
                      <i className="bi bi-heart"></i>
                    </button>
                  </div>
                  <div className="listing-body">
                    <h6 className="listing-title">{card.title}</h6>
                    <p className="listing-location"><i className="bi bi-geo-alt-fill"></i> {card.location}</p>
                    <div className="listing-tags">{card.tags.map(t => <span className="listing-tag" key={t}>{t}</span>)}</div>
                    <div className="listing-footer">
                      <div className="listing-price">{card.price} <span>/ day</span></div>
                      <div className="listing-rating"><i className="bi bi-star-fill"></i> {card.rating} <span>({card.reviews})</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <button className="btn btn-nexa-outline" onClick={() => navigate('/search')}>
              View All Listings <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </section>

      {/* WHY NEXA */}
      <section className="section-padding" id="features">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag"><i className="bi bi-heart"></i> Why Nexa</span>
            <h2>Built for <span className="text-gradient">Drivers &amp; Hosts</span></h2>
            <p>Everything you need to rent or list parking — all in one platform.</p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'bi-map', color: 'purple', title: 'Interactive Map', desc: 'Browse available spaces on a real-time map. Zoom, filter, and find the perfect spot near your destination.' },
              { icon: 'bi-shield-fill-check', color: 'teal', title: 'Verified Listings', desc: 'Every space is reviewed and verified by our team. No fake listings, no surprises.' },
              { icon: 'bi-credit-card-fill', color: 'purple', title: 'Secure Payments', desc: 'Pay safely through the platform. Hosts get paid automatically — drivers are protected.' },
              { icon: 'bi-chat-dots-fill', color: 'teal', title: 'In-App Messaging', desc: 'Chat directly with your host or driver. Instructions, gate codes, and questions — all in one place.' },
            ].map((f, i) => (
              <div className="col-lg-3 col-md-6" key={i}>
                <div className="nexa-card text-center h-100">
                  <div className={`feature-icon ${f.color} mx-auto`}><i className={`bi ${f.icon}`}></i></div>
                  <h5>{f.title}</h5>
                  <p className="text-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-dark-light">
        <div className="container text-center">
          <div className="section-header">
            <span className="section-tag"><i className="bi bi-house-heart"></i> List Your Space</span>
            <h2>Turn Your <span className="text-gradient">Parking Space</span> into Income</h2>
            <p className="mx-auto" style={{ maxWidth: 540 }}>
              Have a driveway or garage sitting empty? List it on NEXA and start earning passive income with zero effort.
            </p>
          </div>
          <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
            <button className="btn btn-nexa btn-nexa-lg" onClick={() => navigate('/register')}>
              <i className="bi bi-plus-circle me-2"></i>List My Space
            </button>
            <button className="btn btn-nexa-outline btn-nexa-lg" onClick={() => navigate('/search')}>
              <i className="bi bi-search me-2"></i>Find Parking
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="nexa-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <span className="brand-n">N</span><span className="brand-rest">EXA</span>
              </div>
              <p className="footer-tagline">The smarter way to park.</p>
            </div>
            <div>
              <h6 className="footer-heading">Explore</h6>
              <ul className="footer-links">
                <li><button className="btn btn-link p-0 text-start footer-link" onClick={() => navigate('/search')}>Search Listings</button></li>
                <li><button className="btn btn-link p-0 text-start footer-link" onClick={() => navigate('/register')}>List Your Space</button></li>
              </ul>
            </div>
            <div>
              <h6 className="footer-heading">Account</h6>
              <ul className="footer-links">
                <li><button className="btn btn-link p-0 text-start footer-link" onClick={() => navigate('/login')}>Log In</button></li>
                <li><button className="btn btn-link p-0 text-start footer-link" onClick={() => navigate('/register')}>Sign Up</button></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 NEXA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
