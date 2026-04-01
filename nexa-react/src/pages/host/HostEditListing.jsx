import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const AMENITY_OPTIONS = ['EV Charging', 'CCTV', 'Well Lit', 'Covered', 'Keypad Entry', 'Near Transit', 'Accessible', '24/7 Access'];

export default function HostEditListing() {
  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <nav style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-500)', marginBottom: '0.5rem' }}>
                <Link to="/host/my-listings" style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>My Listings</Link>
                <span style={{ margin: '0 0.4rem' }}>/</span>
                <Link to="/host/listing-details" style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>Capitol Hill Garage</Link>
                <span style={{ margin: '0 0.4rem' }}>/</span>
                <span style={{ color: 'var(--nexa-gray-200)' }}>Edit</span>
              </nav>
              <h1 className="dash-page-title">Edit Listing</h1>
            </div>
            <Link to="/host/listing-details" className="btn btn-nexa-outline btn-nexa-sm">
              <i className="bi bi-arrow-left me-1"></i> Discard Changes
            </Link>
          </div>

          <div className="lsr-edit-layout">
            {/* Main form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Basic Information</h3>
                <div className="lsr-form-grid">
                  <div className="lsr-form-group lsr-form-group--full">
                    <label className="lsr-label">Listing title</label>
                    <input type="text" className="lsr-input" defaultValue="Capitol Hill Garage · Seattle" />
                  </div>
                  <div className="lsr-form-group">
                    <label className="lsr-label">Parking type</label>
                    <select className="lsr-input" defaultValue="Covered Garage">
                      <option>Garage</option><option>Driveway</option><option selected>Covered Garage</option><option>Outdoor Lot</option><option>Underground</option><option>Street</option>
                    </select>
                  </div>
                  <div className="lsr-form-group">
                    <label className="lsr-label">Max vehicle size</label>
                    <select className="lsr-input">
                      <option>Compact</option><option>Standard</option><option selected>SUV / Midsize</option><option>Truck / Large</option>
                    </select>
                  </div>
                  <div className="lsr-form-group lsr-form-group--full">
                    <label className="lsr-label">Address</label>
                    <input type="text" className="lsr-input" defaultValue="123 Pike St" />
                  </div>
                  <div className="lsr-form-group"><label className="lsr-label">City</label><input type="text" className="lsr-input" defaultValue="Seattle" /></div>
                  <div className="lsr-form-group"><label className="lsr-label">ZIP code</label><input type="text" className="lsr-input" defaultValue="98122" /></div>
                  <div className="lsr-form-group lsr-form-group--full">
                    <label className="lsr-label">Description</label>
                    <textarea className="lsr-input lsr-textarea" rows={4} defaultValue="Secure covered garage in the heart of Capitol Hill. 24/7 keycard access, well lit, EV charging available. Easy walking distance to restaurants, bars, and transit."></textarea>
                  </div>
                </div>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Amenities</h3>
                <div className="lsr-amenity-grid">
                  {AMENITY_OPTIONS.map(a => (
                    <label key={a} className="lsr-amenity-item" style={{ cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={['EV Charging', 'CCTV', 'Well Lit', 'Covered', 'Keypad Entry', '24/7 Access'].includes(a)} style={{ marginRight: '0.4rem' }} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Photos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                      <img
                        src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=300&q=50"
                        alt=""
                        style={{ width: '100%', height: 90, objectFit: 'cover' }}
                      />
                      <button style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="lsr-upload-zone" style={{ padding: '1.5rem' }}>
                  <i className="bi bi-cloud-upload d-block mb-1" style={{ fontSize: '1.5rem', color: 'var(--nexa-gray-500)' }}></i>
                  <p style={{ color: 'var(--nexa-gray-400)', margin: 0, fontSize: '0.875rem' }}>Click or drag to add photos</p>
                </div>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Pricing</h3>
                <div className="lsr-form-grid">
                  <div className="lsr-form-group"><label className="lsr-label">Daily rate ($)</label><input type="number" className="lsr-input" defaultValue="14" /></div>
                  <div className="lsr-form-group"><label className="lsr-label">Weekly rate ($)</label><input type="number" className="lsr-input" defaultValue="80" /></div>
                  <div className="lsr-form-group"><label className="lsr-label">Monthly rate ($)</label><input type="number" className="lsr-input" defaultValue="250" /></div>
                  <div className="lsr-form-group">
                    <label className="lsr-label">Min. booking duration</label>
                    <select className="lsr-input"><option>1 day</option><option>2 days</option><option>3 days</option><option>1 week</option></select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky right panel */}
            <div>
              <div className="dash-card lsr-save-bar">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Publish</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lsr-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Status</label>
                  <select className="lsr-input">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-nexa w-100"><i className="bi bi-save2 me-2"></i>Save Changes</button>
                  <Link to="/host/listing-details" className="btn btn-nexa-outline w-100">Preview</Link>
                  <Link to="/host/my-listings" className="btn btn-nexa-outline w-100" style={{ color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.4)' }}>Discard Changes</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
