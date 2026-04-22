import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AMENITY_OPTIONS = ['EV Charging', 'CCTV', 'Well Lit', 'Covered', 'Keypad Entry', 'Near Transit', 'Accessible', '24/7 Access'];

export default function HostEditListing() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [title, setTitle] = useState('');
  const [listingTitle, setListingTitle] = useState('');
  const [parkingType, setParkingType] = useState('garage');
  const [maxVehicleSize, setMaxVehicleSize] = useState('standard');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [dailyRate, setDailyRate] = useState('');
  const [minimumBookingDays, setMinimumBookingDays] = useState(1);
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('No listing ID provided.');
      setLoading(false);
      return;
    }

    async function fetchListing() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/parking-spaces/${id}`, {
          withCredentials: true,
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        const l = response.data;
        setTitle(l.title || '');
        setListingTitle(l.title || '');
        setParkingType(l.parkingType || 'garage');
        setMaxVehicleSize(l.maxVehicleSize || 'standard');
        setAddress(l.location?.address || '');
        setCity(l.location?.city || '');
        setZipCode(l.location?.zipCode || '');
        setLatitude(l.location?.latitude || 0);
        setLongitude(l.location?.longitude || 0);
        setDescription(l.description || '');
        setAmenities(l.amenities || []);
        setDailyRate(l.dailyRate ?? '');
        setMinimumBookingDays(l.minimumBookingDays || 1);
        setIsPublished(l.isPublished ?? true);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing.');
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  function toggleAmenity(a) {
    setAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/parking-spaces/${id}`,
        {
          title,
          parkingType,
          maxVehicleSize,
          location: { address, city, zipCode, latitude, longitude },
          description,
          amenities,
          dailyRate: Number(dailyRate),
          minimumBookingDays: Number(minimumBookingDays),
          isPublished,
        },
        {
          withCredentials: true,
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }
      );
      setSuccessMsg('Changes saved!');
      setListingTitle(title);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dash-page">
        <Navbar variant="dashboard" />
        <div className="dash-layout">
          <HostSidebar />
          <main className="dash-main">
            <p style={{ color: 'var(--nexa-gray-400)', padding: '2rem' }}>Loading…</p>
          </main>
        </div>
      </div>
    );
  }

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
                <Link to={`/host/listing-details?id=${id}`} style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>{listingTitle}</Link>
                <span style={{ margin: '0 0.4rem' }}>/</span>
                <span style={{ color: 'var(--nexa-gray-200)' }}>Edit</span>
              </nav>
              <h1 className="dash-page-title">Edit Listing</h1>
            </div>
            <Link to={`/host/listing-details?id=${id}`} className="btn btn-nexa-outline btn-nexa-sm">
              <i className="bi bi-arrow-left me-1"></i> Discard Changes
            </Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSave}>
            <div className="lsr-edit-layout">
              {/* Main form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="dash-card">
                  <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Basic Information</h3>
                  <div className="lsr-form-grid">
                    <div className="lsr-form-group lsr-form-group--full">
                      <label className="lsr-label">Listing title</label>
                      <input type="text" className="lsr-input" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="lsr-form-group">
                      <label className="lsr-label">Parking type</label>
                      <select className="lsr-input" value={parkingType} onChange={e => setParkingType(e.target.value)}>
                        <option value="garage">Garage</option>
                        <option value="driveway">Driveway</option>
                        <option value="covered">Covered Garage</option>
                        <option value="open lot">Outdoor Lot</option>
                      </select>
                    </div>
                    <div className="lsr-form-group">
                      <label className="lsr-label">Max vehicle size</label>
                      <select className="lsr-input" value={maxVehicleSize} onChange={e => setMaxVehicleSize(e.target.value)}>
                        <option value="compact">Compact</option>
                        <option value="standard">Standard</option>
                        <option value="suv/midsize">SUV / Midsize</option>
                        <option value="truck/large">Truck / Large</option>
                      </select>
                    </div>
                    <div className="lsr-form-group lsr-form-group--full">
                      <label className="lsr-label">Address</label>
                      <input type="text" className="lsr-input" value={address} onChange={e => setAddress(e.target.value)} required />
                    </div>
                    <div className="lsr-form-group">
                      <label className="lsr-label">City</label>
                      <input type="text" className="lsr-input" value={city} onChange={e => setCity(e.target.value)} required />
                    </div>
                    <div className="lsr-form-group">
                      <label className="lsr-label">ZIP code</label>
                      <input type="text" className="lsr-input" value={zipCode} onChange={e => setZipCode(e.target.value)} />
                    </div>
                    <div className="lsr-form-group lsr-form-group--full">
                      <label className="lsr-label">Description</label>
                      <textarea className="lsr-input lsr-textarea" rows={4} value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>
                  </div>
                </div>

                <div className="dash-card">
                  <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Amenities</h3>
                  <div className="lsr-amenity-grid">
                    {AMENITY_OPTIONS.map(a => (
                      <label key={a} className="lsr-amenity-item" style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ marginRight: '0.4rem' }} />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="dash-card">
                  <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Pricing</h3>
                  <div className="lsr-form-grid">
                    <div className="lsr-form-group">
                      <label className="lsr-label">Daily rate ($)</label>
                      <input type="number" className="lsr-input" value={dailyRate} onChange={e => setDailyRate(e.target.value)} min="0" required />
                    </div>
                    <div className="lsr-form-group">
                      <label className="lsr-label">Min. booking duration (days)</label>
                      <input type="number" className="lsr-input" value={minimumBookingDays} onChange={e => setMinimumBookingDays(e.target.value)} min="1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky right panel */}
              <div>
                <div className="dash-card lsr-save-bar" style={{ padding: '1.2rem'}}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="lsr-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Publish Status</label>
                    <select className="lsr-input" value={isPublished ? 'active' : 'paused'} onChange={e => setIsPublished(e.target.value === 'active')}>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                  {successMsg && (
                    <div style={{ fontSize: '0.875rem', color: '#4caf50', marginBottom: '0.5rem' }}>
                      <i className="bi bi-check-circle me-1"></i>{successMsg}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-nexa w-100" disabled={saving}>
                      <i className="bi bi-save2 me-2"></i>{saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <Link to={`/host/listing-details?id=${id}`} className="btn btn-nexa-outline w-100">Preview</Link>
                    <Link to="/host/my-listings" className="btn btn-nexa-outline w-100" style={{ color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.4)' }}>Discard Changes</Link>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
