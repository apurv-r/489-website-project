import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RESULTS = [
  { id: 1, lat: 47.6205, lng: -122.3493, img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80', title: 'Private Garage — Capitol Hill', location: '0.3 mi · Capitol Hill, Seattle', tags: ['Garage'], price: '$18', rating: '4.9' },
  { id: 2, lat: 47.6145, lng: -122.3440, img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&q=80', title: 'Spacious Driveway — Belltown', location: '0.5 mi · Belltown, Seattle', tags: ['Driveway'], price: '$12', rating: '4.7' },
  { id: 3, lat: 47.6588, lng: -122.3130, img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80', title: 'Open Lot — University District', location: '1.2 mi · U-District, Seattle', tags: ['Open Lot'], price: '$8', rating: '4.5' },
  { id: 4, lat: 47.6062, lng: -122.3321, img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&q=80', title: 'Covered Driveway — Fremont', location: '2.1 mi · Fremont, Seattle', tags: ['Covered'], price: '$10', rating: '4.6' },
  { id: 5, lat: 47.6503, lng: -122.3500, img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80', title: 'Secure Garage — Queen Anne', location: '1.8 mi · Queen Anne, Seattle', tags: ['Garage', 'Covered'], price: '$22', rating: '5.0' },
  { id: 6, lat: 47.6800, lng: -122.3860, img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&q=80', title: 'Budget Lot — Ballard', location: '3.5 mi · Ballard, Seattle', tags: ['Open Lot'], price: '$6', rating: '4.2' },
  { id: 7, lat: 47.5951, lng: -122.3209, img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80', title: 'Private Driveway — SoDo', location: '1.4 mi · SoDo, Seattle', tags: ['Driveway'], price: '$9', rating: '4.4' },
  { id: 8, lat: 47.6740, lng: -122.1215, img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&q=80', title: 'Covered Spot — Bellevue', location: '8 mi · Bellevue, WA', tags: ['Covered'], price: '$14', rating: '4.8' },
];

const TYPES = ['all', 'garage', 'driveway', 'open-lot', 'covered'];

export default function Search() {
  const [activeType, setActiveType] = useState('all');

  const filtered = activeType === 'all'
    ? RESULTS
    : RESULTS.filter(r => r.tags.some(t => t.toLowerCase().replace(' ', '-') === activeType));

  return (
    <div className="search-page">
      <Navbar variant="public" />
      <div className="search-layout">
        {/* LEFT PANEL */}
        <div className="search-panel" id="searchPanel">
          {/* Filters */}
          <div className="search-filters">
            <div className="search-filters-top">
              <div className="position-relative search-location-input">
                <i className="bi bi-geo-alt-fill search-filter-icon"></i>
                <input type="text" className="form-control" defaultValue="Seattle, WA" placeholder="Location…" />
              </div>
              <div className="search-date-range">
                <div className="position-relative">
                  <i className="bi bi-calendar3 search-filter-icon"></i>
                  <input type="date" className="form-control search-filter-date" />
                </div>
                <span className="date-separator">→</span>
                <div className="position-relative">
                  <i className="bi bi-calendar3 search-filter-icon"></i>
                  <input type="date" className="form-control search-filter-date" />
                </div>
              </div>
            </div>
            <div className="search-filters-row">
              <div className="filter-chips">
                {TYPES.map(t => (
                  <button key={t} className={`filter-chip${activeType === t ? ' active' : ''}`} onClick={() => setActiveType(t)}>
                    {t === 'all' && 'All'}
                    {t === 'garage' && <><i className="bi bi-building me-1"></i>Garage</>}
                    {t === 'driveway' && <><i className="bi bi-house-door me-1"></i>Driveway</>}
                    {t === 'open-lot' && <><i className="bi bi-square me-1"></i>Open Lot</>}
                    {t === 'covered' && <><i className="bi bi-umbrella me-1"></i>Covered</>}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-result-count">
              <span className="text-gradient fw-bold">{filtered.length}</span> parking spots found near <strong>Seattle, WA</strong>
            </div>
          </div>

          {/* Results */}
          <div className="search-results" id="searchResults">
            {filtered.map(r => (
              <Link to="/details" className="search-result-card" key={r.id}>
                <div className="search-result-img">
                  <img src={r.img} alt={r.title} />
                  <button className="listing-save" onClick={e => e.preventDefault()}>
                    <i className="bi bi-heart"></i>
                  </button>
                </div>
                <div className="search-result-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="search-result-title">{r.title}</h6>
                    <div className="listing-rating"><i className="bi bi-star-fill"></i> {r.rating}</div>
                  </div>
                  <p className="search-result-location"><i className="bi bi-geo-alt-fill"></i> {r.location}</p>
                  <div className="listing-tags">{r.tags.map(t => <span className="listing-tag" key={t}>{t}</span>)}</div>
                  <div className="search-result-footer">
                    <div className="listing-price">{r.price} <span>/ day</span></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* MAP PLACEHOLDER */}
        <div className="search-map" id="searchMap" style={{ background: 'var(--nexa-dark-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center" style={{ color: 'var(--nexa-gray-400)' }}>
            <i className="bi bi-map fs-1 mb-2 d-block"></i>
            <p>Interactive map — integrate Leaflet here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
