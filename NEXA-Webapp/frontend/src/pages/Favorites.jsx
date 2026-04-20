import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LesseeSidebar from '../components/LesseeSidebar';
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Favorites(user) {
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);

  async function fetchFavs() {
    if (!user?._id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${user._id}/favorites`, {
        withCredentials: true,
      });
      setFavs(response.data.map(listing => ({
        id: listing._id,
        img: listing.imageUrls?.[0] || '',
        badge: listing.parkingType || 'Parking',
        type: listing.parkingType || 'Parking',
        name: listing.title || '',
        addr: listing.location?.address || '',
        rating: listing.reviewCount > 0 ? Number(listing.ratingAverage).toFixed(1) : '—',
        price: `$${Number(listing.dailyRate).toFixed(2)}`,
        listingId: listing._id,
      })));
    } catch (error) {
      console.log('error fetching favorites:', error);
    }
  }

  async function remove(id) {
    if (!user?._id) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${user._id}/favorites/${id}`, {
        withCredentials: true,
      });
      setFavs(f => f.filter(x => x.id !== id));
    } catch (error) {
      console.log('error removing favorite:', error);
    }
  }

  useEffect(() => {
    fetchFavs();
  }, [user?._id]);

  return (
    <div className="dash-page">
      <div className="dash-layout">
        <LesseeSidebar {...user}/>
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
                  <Link to={`/details?id=${card.id}`} className="fav-card-img-wrap">
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
