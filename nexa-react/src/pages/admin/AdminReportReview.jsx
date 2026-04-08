import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminReportReview() {
  const navigate = useNavigate();
  const [note, setNote] = useState('');

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <nav style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-500)', marginBottom: '0.5rem' }}>
            <Link to="/admin/reports" style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>Reports</Link>
            <span style={{ margin: '0 0.4rem' }}>/</span>
            <span style={{ color: 'var(--nexa-gray-200)' }}>RPT-2025-0041</span>
          </nav>
          <h1 className="adm-page-title">Report Review</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Report summary */}
            <div className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 700 }}>Inaccurate listing</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--nexa-gray-500)' }}>RPT-2025-0041 · Submitted Jun 7, 2025</p>
                </div>
                <span style={{ padding: '0.25em 0.8em', borderRadius: 20, background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', fontSize: '0.78rem', fontWeight: 600 }}>Open</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Reporter', value: 'Marcus Thompson' },
                  { label: 'Target', value: 'Capitol Hill Garage (Listing)' },
                  { label: 'Reporter Email', value: 'marcus@email.com' },
                  { label: 'Target Host', value: 'Kevin Scott' },
                ].map(d => (
                  <div key={d.label}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{d.label}</p>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence / description */}
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Reporter's Description</h3>
              <p style={{ color: 'var(--nexa-gray-300)', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>
                "The listing said the garage was covered and had EV charging, but when I arrived, it was an open-air lot with no EV outlets. The photos showed a different location entirely. I had to find alternative parking last-minute which cost me an extra $30."
              </p>
            </div>

            {/* Timeline */}
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '1.25rem' }}>Timeline</h3>
              {[
                { date: 'Jun 7, 2025 · 2:10 PM', label: 'Report submitted by Marcus T.' },
                { date: 'Jun 7, 2025 · 3:00 PM', label: 'Report auto-assigned to review queue' },
                { date: 'Jun 8, 2025 · 9:30 AM', label: 'Opened by Admin J. Smith' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--nexa-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', width: 180, flexShrink: 0 }}>{t.date}</span>
                  <span style={{ fontSize: '0.875rem' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Take Action</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => navigate('/admin/reports')} className="btn w-100" style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-check2-circle me-2"></i>Mark Resolved
                </button>
                <button className="btn w-100" style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-shield-exclamation me-2"></i>Suspend Listing
                </button>
                <button className="btn w-100" style={{ background: 'rgba(253,200,65,0.12)', color: '#fdc841', border: '1px solid rgba(253,200,65,0.3)', borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>Warn Host
                </button>
                <button onClick={() => navigate('/admin/reports')} className="btn w-100" style={{ background: 'rgba(160,160,176,0.12)', color: '#a0a0b0', border: '1px solid rgba(160,160,176,0.3)', borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-x-circle me-2"></i>Close (No Action)
                </button>
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '0.75rem' }}>Internal Note</h3>
              <textarea rows={4} placeholder="Add a moderation note…" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', background: 'var(--nexa-bg)', border: '1px solid var(--nexa-border)', borderRadius: 8, padding: '0.6rem 0.75rem', color: 'var(--nexa-gray-200)', resize: 'vertical', fontSize: '0.875rem', boxSizing: 'border-box' }}></textarea>
              <button className="btn btn-nexa w-100" style={{ marginTop: '0.75rem' }}>Save Note</button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/user-detail" className="btn btn-nexa-outline w-100" style={{ fontSize: '0.78rem' }}>View Reporter</Link>
              <Link to="/admin/listing-review" className="btn btn-nexa-outline w-100" style={{ fontSize: '0.78rem' }}>View Listing</Link>
            </div>

            <Link to="/admin/reports" className="btn btn-nexa-outline w-100"><i className="bi bi-arrow-left me-1"></i>Back to Reports</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
