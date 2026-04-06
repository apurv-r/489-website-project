import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const PHOTOS = [
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=300&q=50',
  'https://images.unsplash.com/photo-1526926746735-26f0e1e0bdab?w=300&q=50',
  'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&q=50',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=50',
];

export default function AdminListingReview() {
  const navigate = useNavigate();
  const [activePhoto, setActivePhoto] = useState(0);
  const [note, setNote] = useState('');

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <nav style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-500)', marginBottom: '0.5rem' }}>
            <Link to="/admin/verification-queue" style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>Verification Queue</Link>
            <span style={{ margin: '0 0.4rem' }}>/</span>
            <span style={{ color: 'var(--nexa-gray-200)' }}>Pioneer Square Lot</span>
          </nav>
          <h1 className="adm-page-title">Listing Review</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Photo strip */}
            <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
              <img
                src={PHOTOS[activePhoto]}
                alt=""
                style={{ width: '100%', height: 280, objectFit: 'cover' }}
                onError={e => { e.target.src = PHOTOS[0]; }}
              />
              <div style={{ display: 'flex', gap: 6, padding: '0.75rem' }}>
                {PHOTOS.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    onClick={() => setActivePhoto(i)}
                    style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: `2px solid ${activePhoto === i ? 'var(--nexa-primary)' : 'transparent'}`, opacity: activePhoto === i ? 1 : 0.6 }}
                    onError={e => { e.target.src = PHOTOS[0]; }}
                  />
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="adm-card">
              <h3 className="adm-card-title">Listing Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                {[
                  { label: 'Title', value: 'Pioneer Square Lot' },
                  { label: 'Type', value: 'Outdoor Lot' },
                  { label: 'City', value: 'Seattle, WA' },
                  { label: 'ZIP', value: '98104' },
                  { label: 'Daily Rate', value: '$10.00/day' },
                  { label: 'Max Vehicle', value: 'Standard' },
                ].map(d => (
                  <div key={d.label}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{d.label}</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{d.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--nexa-gray-500)', margin: '0 0 0.4rem' }}>Description</p>
                <p style={{ color: 'var(--nexa-gray-300)', lineHeight: 1.6, margin: 0, fontSize: '0.875rem' }}>
                  Open-air parking lot in Pioneer Square. Easy access, flat rates, no height restrictions. Steps away from King Street Station.
                </p>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--nexa-gray-500)', margin: '0 0 0.5rem' }}>Amenities</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['CCTV', 'Well Lit', 'Near Transit'].map(a => (
                    <span key={a} style={{ padding: '0.25em 0.75em', background: 'var(--nexa-surface-2)', borderRadius: 20, fontSize: '0.78rem', color: 'var(--nexa-gray-400)' }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Host info */}
            <div className="adm-card">
              <h3 className="adm-card-title">Host</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(253,200,65,0.12)', border: '2px solid rgba(253,200,65,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fdc841' }}>K</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>Kevin Scott</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nexa-gray-500)' }}>kevin@email.com · Joined Dec 2024</p>
                </div>
                <Link to="/admin/user-detail" className="btn btn-nexa-outline btn-nexa-sm ms-auto">View Profile</Link>
              </div>
            </div>
          </div>

          {/* Action panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Decision</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => navigate('/admin/verification-queue')} className="btn w-100" style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 8, padding: '0.65rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-check2-circle me-2"></i>Approve Listing
                </button>
                <button onClick={() => navigate('/admin/verification-queue')} className="btn w-100" style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '0.65rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-x-circle me-2"></i>Reject Listing
                </button>
                <button className="btn w-100" style={{ background: 'rgba(253,200,65,0.12)', color: '#fdc841', border: '1px solid rgba(253,200,65,0.3)', borderRadius: 8, padding: '0.65rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-question-circle me-2"></i>Request More Info
                </button>
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '0.75rem' }}>Review Note</h3>
              <textarea rows={4} placeholder="Add an internal note or reason…" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', background: 'var(--nexa-bg)', border: '1px solid var(--nexa-border)', borderRadius: 8, padding: '0.6rem 0.75rem', color: 'var(--nexa-gray-200)', resize: 'vertical', fontSize: '0.875rem', boxSizing: 'border-box' }}></textarea>
              <button className="btn btn-nexa w-100" style={{ marginTop: '0.75rem' }}>Save Note</button>
            </div>

            <Link to="/admin/verification-queue" className="btn btn-nexa-outline w-100"><i className="bi bi-arrow-left me-1"></i>Back to Queue</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
