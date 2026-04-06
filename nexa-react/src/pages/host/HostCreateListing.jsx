import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const STEPS = ['Basic Info', 'Photos', 'Pricing & Availability', 'Review'];

const AMENITY_OPTIONS = ['EV Charging', 'CCTV', 'Well Lit', 'Covered', 'Keypad Entry', 'Near Transit', 'Accessible', '24/7 Access'];

export default function HostCreateListing() {
  const [step, setStep] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [success, setSuccess] = useState(false);

  function toggleAmenity(a) {
    setSelectedAmenities(arr => arr.includes(a) ? arr.filter(x => x !== a) : [...arr, a]);
  }

  function next() { if (step < STEPS.length - 1) setStep(s => s + 1); }
  function back() { if (step > 0) setStep(s => s - 1); }

  if (success) {
    return (
      <div className="dash-page lsr-page">
        <Navbar variant="dashboard" />
        <div className="dash-layout">
          <HostSidebar />
          <main className="dash-main">
            <div className="text-center py-5">
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,230,118,0.12)', border: '2px solid rgba(0,230,118,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <i className="bi bi-check-lg" style={{ fontSize: '2rem', color: '#00e676' }}></i>
              </div>
              <h2>Listing Submitted!</h2>
              <p style={{ color: 'var(--nexa-gray-400)' }}>Your listing has been submitted for review. We'll notify you once it's approved.</p>
              <div className="d-flex gap-3 justify-content-center mt-4">
                <Link to="/host/my-listings" className="btn btn-nexa-outline">Back to Listings</Link>
                <button className="btn btn-nexa" onClick={() => { setStep(0); setSuccess(false); }}>Add Another Listing</button>
              </div>
            </div>
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
              <h1 className="dash-page-title">Create New Listing</h1>
              <p className="dash-page-sub">Fill in the details to list your parking space.</p>
            </div>
            <Link to="/host/my-listings" className="btn btn-nexa-outline btn-nexa-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Listings
            </Link>
          </div>

          {/* Step indicator */}
          <div className="lsr-steps">
            {STEPS.map((s, i) => (
              <>
                <div key={i} className={`lsr-step${i <= step ? ' active' : ''}`}>
                  <span className="lsr-step-num">{i + 1}</span>
                  <span className="lsr-step-label">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className="lsr-step-line" key={`line-${i}`}></div>}
              </>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 0 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: '1.5rem' }}>Basic Information</h2>
              <div className="lsr-form-grid">
                <div className="lsr-form-group lsr-form-group--full">
                  <label className="lsr-label">Listing title</label>
                  <input type="text" className="lsr-input" placeholder="e.g. Private Garage · Capitol Hill" />
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Parking type</label>
                  <select className="lsr-input">
                    <option value="">Select type</option>
                    <option>Garage</option><option>Driveway</option><option>Outdoor Lot</option>
                    <option>Underground</option><option>Covered</option><option>Street</option>
                  </select>
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Max vehicle size</label>
                  <select className="lsr-input">
                    <option>Compact</option><option>Standard</option><option>SUV / Midsize</option><option>Truck / Large</option>
                  </select>
                </div>
                <div className="lsr-form-group lsr-form-group--full">
                  <label className="lsr-label">Address</label>
                  <input type="text" className="lsr-input" placeholder="Street address" />
                </div>
                <div className="lsr-form-group"><label className="lsr-label">City</label><input type="text" className="lsr-input" placeholder="Seattle" /></div>
                <div className="lsr-form-group"><label className="lsr-label">ZIP code</label><input type="text" className="lsr-input" placeholder="98101" /></div>
                <div className="lsr-form-group lsr-form-group--full">
                  <label className="lsr-label">Description</label>
                  <textarea className="lsr-input lsr-textarea" rows={4} placeholder="Describe your space — access instructions, nearby landmarks, special features…"></textarea>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label className="lsr-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Amenities</label>
                <div className="lsr-amenity-grid">
                  {AMENITY_OPTIONS.map(a => (
                    <label key={a} className={`lsr-amenity-item${selectedAmenities.includes(a) ? ' selected' : ''}`} onClick={() => toggleAmenity(a)} style={{ cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedAmenities.includes(a)} readOnly style={{ display: 'none' }} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 1 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: '1.5rem' }}>Photos</h2>
              <div className="lsr-upload-zone">
                <i className="bi bi-cloud-upload fs-2 d-block mb-2" style={{ color: 'var(--nexa-gray-500)' }}></i>
                <p style={{ color: 'var(--nexa-gray-400)' }}>Drag &amp; drop photos here, or click to browse</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--nexa-gray-600)' }}>PNG, JPG up to 10 MB each. Min. 3, max. 12 photos.</p>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Availability */}
          {step === 2 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: '1.5rem' }}>Pricing &amp; Availability</h2>
              <div className="lsr-form-grid">
                <div className="lsr-form-group">
                  <label className="lsr-label">Daily rate ($)</label>
                  <input type="number" className="lsr-input" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Weekly rate ($) <span style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)' }}>(optional)</span></label>
                  <input type="number" className="lsr-input" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Monthly rate ($) <span style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)' }}>(optional)</span></label>
                  <input type="number" className="lsr-input" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Min. booking duration</label>
                  <select className="lsr-input">
                    <option>1 day</option><option>2 days</option><option>3 days</option><option>1 week</option><option>1 month</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label className="lsr-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Available days</label>
                <div className="lsr-day-pills">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <label key={d} className="lsr-day-pill"><input type="checkbox" defaultChecked />{d}</label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: '1.5rem' }}>Review Your Listing</h2>
              <p style={{ color: 'var(--nexa-gray-400)' }}>Double-check your information before submitting for review. Our team will verify and publish your listing within 24 hours.</p>
              <div className="alert" style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: '10px', padding: '1rem', marginTop: '1rem' }}>
                <i className="bi bi-info-circle me-2" style={{ color: 'var(--nexa-primary)' }}></i>
                By submitting, you confirm this is an accurate description of your space and you agree to NEXA's Host Terms.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-nexa-outline" onClick={back} disabled={step === 0}>
              <i className="bi bi-arrow-left me-1"></i> Back
            </button>
            {step < STEPS.length - 1
              ? <button className="btn btn-nexa" onClick={next}>Next <i className="bi bi-arrow-right ms-1"></i></button>
              : <button className="btn btn-nexa" onClick={() => setSuccess(true)}><i className="bi bi-send-fill me-2"></i>Submit Listing</button>
            }
          </div>
        </main>
      </div>
    </div>
  );
}
