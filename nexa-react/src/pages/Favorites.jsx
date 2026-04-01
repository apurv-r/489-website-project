import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LesseeSidebar from '../components/LesseeSidebar';

const INITIAL_FAVS = [
  { id: 1, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80', badge: 'Garage', type: 'Private Garage', name: 'Private Garage · Capitol Hill', addr: '1421 10th Ave, Seattle, WA', rating: '4.9', price: '$18' },
  { id: 2, img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&q=80', badge: 'Covered', type: 'Covered Spot', name: 'Covered Spot · Pioneer Square', addr: '200 2nd Ave S, Seattle, WA', rating: '4.8', price: '$22' },
  { id: 3, img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=500&q=80', badge: 'Open Lot', type: 'Open Lot', name: 'Open Lot · Space Needle', addr: '201 4th Ave N, Seattle, WA', rating: '4.6', price: '$10' },
  { id: 4, img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&q=80', badge: 'Driveway', type: 'Driveway', name: 'Shaded Driveway · Queen Anne', addr: '515 W Highland Dr, Seattle, WA', rating: '4.7', price: '$14' },
];

export default function Favorites() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState(INITIAL_FAVS);

  function remove(id) {
    setFavs(f => f.filter(x => x.id !== id));
  }

  return (
    <div className="dash-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <LesseeSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">Favorites</h1>
              <p className="dash-page-sub">Parking spots you've saved for later.</p>
            </div>
            <Link to="/search" className="btn btn-nexa btn-nexa-sm">
              <i className="bi bi-search me-1"></i> Find More
            </Link>
          </div>

          {favs.length === 0 ? (
            <div className="fav-empty text-center py-5">
              <i className="bi bi-heart fs-1 mb-3 d-block" style={{ color: 'var(--nexa-gray-600)' }}></i>
              <p>No saved listings yet.</p>
              <Link to="/search" className="btn btn-nexa mt-2">Browse Parking</Link>
            </div>
          ) : (
            <div className="fav-grid">
              {favs.map(card => (
                <div className="fav-card" key={card.id}>
                  <Link to="/details" className="fav-card-img-wrap">
                    <img src={card.img} alt={card.name} className="fav-card-img" />
                    <span className="fav-card-badge">{card.badge}</span>
                  </Link>
                  <button className="fav-card-heart fav-card-heart--saved" title="Remove from favorites" onClick={() => remove(card.id)}>
                    <i className="bi bi-heart-fill"></i>
                  </button>
                  <div className="fav-card-body">
                    <div className="fav-card-top">
                      <div>
                        <div className="fav-card-type">{card.type}</div>
                        <h3 className="fav-card-name">{card.name}</h3>
                        <div className="fav-card-addr"><i className="bi bi-geo-alt-fill"></i> {card.addr}</div>
                      </div>
                      <div className="fav-card-rating"><i className="bi bi-star-fill"></i> {card.rating}</div>
                    </div>
                    <div className="fav-card-footer">
                      <div className="fav-card-price">{card.price} <span>/ day</span></div>
                      <button className="btn btn-nexa btn-nexa-sm" onClick={() => navigate('/booking')}>Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
