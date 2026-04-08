import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const LISTINGS = [
  { img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80', name: 'Private Garage · Capitol Hill', addr: '1421 10th Ave, Seattle, WA', type: 'Garage', price: '$5/day', rating: '4.9', reviews: 38, status: 'active' },
  { img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&q=80', name: 'Covered Driveway · Fremont', addr: '3812 Fremont Ave N, Seattle, WA', type: 'Driveway', price: '$7/day', rating: '4.8', reviews: 22, status: 'active' },
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', name: 'Outdoor Lot · Belltown', addr: '700 2nd Ave, Seattle, WA', type: 'Open Lot', price: '$3.50/day', rating: '4.5', reviews: 14, status: 'paused' },
];

export default function HostMyListings() {
  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">My Listings</h1>
              <p className="dash-page-sub">Manage your active and paused parking spaces.</p>
            </div>
            <Link to="/host/create-listing" className="btn btn-nexa btn-nexa-sm">
              <i className="bi bi-plus-lg me-1"></i> New Listing
            </Link>
          </div>

          <div className="lsr-listings-grid">
            {LISTINGS.map((l, i) => (
              <div className="lsr-listing-card" key={i}>
                <div className="lsr-listing-card-img-wrap">
                  <img src={l.img} alt={l.name} className="lsr-listing-card-img" />
                  <span className={`lsr-badge lsr-badge-${l.status}`}>{l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span>
                </div>
                <div className="lsr-listing-card-body">
                  <div className="lsr-listing-card-type">{l.type}</div>
                  <h3 className="lsr-listing-card-name">{l.name}</h3>
                  <div className="lsr-listing-card-addr"><i className="bi bi-geo-alt-fill"></i> {l.addr}</div>
                  <div className="lsr-listing-card-meta">
                    <span className="lsr-listing-card-price">{l.price}</span>
                    <span><i className="bi bi-star-fill"></i> {l.rating} ({l.reviews})</span>
                  </div>
                  <div className="lsr-listing-card-actions">
                    <Link to="/host/listing-details" className="lsr-action-btn lsr-action-btn--view"><i className="bi bi-eye"></i> View</Link>
                    <Link to="/host/edit-listing" className="lsr-action-btn lsr-action-btn--edit"><i className="bi bi-pencil"></i> Edit</Link>
                    <button className="lsr-action-btn lsr-action-btn--delete"><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
