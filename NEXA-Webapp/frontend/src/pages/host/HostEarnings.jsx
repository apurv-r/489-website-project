import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DATE_FILTERS = ['7 days', '30 days', '90 days', 'This Year', 'All Time'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function filterByDate(bookings, filter) {
  const now = new Date();
  return bookings.filter(b => {
    const d = new Date(b.createdAt);
    if (filter === '7 days')   return (now - d) <= 7 * 86400000;
    if (filter === '30 days')  return (now - d) <= 30 * 86400000;
    if (filter === '90 days')  return (now - d) <= 90 * 86400000;
    if (filter === 'This Year') return d.getFullYear() === now.getFullYear();
    return true;
  });
}

export default function HostEarnings() {
  const [dateFilter, setDateFilter] = useState('All Time');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem('token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
        const res = await axios.get(`${API_BASE_URL}/api/bookings/me`, { withCredentials: true, headers });
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load earnings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const transactions = useMemo(() => {
    const filtered = filterByDate(bookings, dateFilter);
    return filtered.map(b => {
      const gross = b.totalAmount || 0;
      const fee = gross * 0.10;
      const net = gross - fee;
      const guestName = b.renter ? `${b.renter.firstName} ${b.renter.lastName ? b.renter.lastName[0] + '.' : ''}`.trim() : 'Guest';
      const listingTitle = b.parkingSpace?.title || 'Unknown Listing';
      return { id: b._id, date: formatDate(b.createdAt), listing: listingTitle, guest: guestName, gross, fee, net };
    });
  }, [bookings, dateFilter]);

  const totalNet   = transactions.reduce((s, t) => s + t.net, 0);
  const totalGross = transactions.reduce((s, t) => s + t.gross, 0);
  const totalFees  = transactions.reduce((s, t) => s + t.fee, 0);

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <h1 className="dash-page-title">Earnings</h1>
            <p className="dash-page-sub">Track your revenue and payouts.</p>
          </div>

          {/* Date filters */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {DATE_FILTERS.map(f => (
              <button key={f} onClick={() => setDateFilter(f)} className={`lsr-df-btn${dateFilter === f ? ' active' : ''}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Net Earnings',  value: `$${totalNet.toFixed(2)}`,   icon: 'bi-cash-stack',     color: 'var(--nexa-lsr)' },
              { label: 'Gross Revenue', value: `$${totalGross.toFixed(2)}`, icon: 'bi-graph-up',       color: '#6c5ce7' },
              { label: 'NEXA Fees',     value: `$${totalFees.toFixed(2)}`,  icon: 'bi-receipt',        color: '#a0a0b0' },
              { label: 'Transactions',  value: transactions.length,         icon: 'bi-calendar-check', color: '#00e676' },
            ].map(s => (
              <div key={s.label} className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--nexa-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--nexa-gray-500)' }}>{s.label}</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: s.color }}>{loading ? '—' : s.value}</p>
                </div>
              </div>
            ))}
          </div>


          {/* Transaction table */}
          <div className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="dash-card-title" style={{ margin: 0 }}>Transactions</h3>
            </div>
            {loading ? (
              <p style={{ color: 'var(--nexa-gray-500)' }}>Loading…</p>
            ) : transactions.length === 0 ? (
              <p style={{ color: 'var(--nexa-gray-500)' }}>No transactions for this period.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="lsr-tx-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--nexa-border)', color: 'var(--nexa-gray-500)' }}>
                      {['Date', 'Listing', 'Guest', 'Gross', 'Fee', 'Net'].map(h => (
                        <th key={h} style={{ padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--nexa-border)' }}>
                        <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)' }}>{t.date}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>{t.listing}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>{t.guest}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>${t.gross.toFixed(2)}</td>
                        <td style={{ padding: '0.6rem 0.5rem', color: '#ff6b6b' }}>−${t.fee.toFixed(2)}</td>
                        <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: 'var(--nexa-lsr)' }}>${t.net.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payout summary */}
          <div className="dash-card" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nexa-gray-500)' }}>Total net earnings</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexa-lsr)' }}>${totalNet.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nexa-gray-500)' }}>Across {transactions.length} booking{transactions.length !== 1 ? 's' : ''} · {dateFilter}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
