import { useState } from 'react';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const DATE_FILTERS = ['7 days', '30 days', '90 days', 'This Year', 'All Time'];

const TRANSACTIONS = [
  { date: 'Jun 8, 2025',  ref: 'NXA-48291', listing: 'Capitol Hill Garage', guest: 'Marcus T.',  nights: 6,  gross: 84.00,  fee: 8.40,  net: 75.60,  status: 'Paid' },
  { date: 'Jun 5, 2025',  ref: 'NXA-48276', listing: 'Eastlake Driveway',   guest: 'Priya M.',  nights: 4,  gross: 48.00,  fee: 4.80,  net: 43.20,  status: 'Paid' },
  { date: 'May 28, 2025', ref: 'NXA-48154', listing: 'Fremont Covered Lot', guest: 'David L.',  nights: 8,  gross: 96.00,  fee: 9.60,  net: 86.40,  status: 'Paid' },
  { date: 'May 10, 2025', ref: 'NXA-47990', listing: 'Capitol Hill Garage', guest: 'James R.',  nights: 7,  gross: 98.00,  fee: 9.80,  net: 88.20,  status: 'Paid' },
  { date: 'Apr 24, 2025', ref: 'NXA-47814', listing: 'Eastlake Driveway',   guest: 'Sarah K.',  nights: 3,  gross: 36.00,  fee: 3.60,  net: 32.40,  status: 'Paid' },
];

export default function HostEarnings() {
  const [dateFilter, setDateFilter] = useState('30 days');

  const total = TRANSACTIONS.reduce((s, t) => s + t.net, 0);
  const gross  = TRANSACTIONS.reduce((s, t) => s + t.gross, 0);
  const fees   = TRANSACTIONS.reduce((s, t) => s + t.fee, 0);
  const maxNet = Math.max(...TRANSACTIONS.map(t => t.net));

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
              { label: 'Net Earnings', value: `$${total.toFixed(2)}`, icon: 'bi-cash-stack', color: 'var(--nexa-lsr)' },
              { label: 'Gross Revenue', value: `$${gross.toFixed(2)}`, icon: 'bi-graph-up', color: '#6c5ce7' },
              { label: 'NEXA Fees', value: `$${fees.toFixed(2)}`, icon: 'bi-receipt', color: '#a0a0b0' },
              { label: 'Transactions', value: TRANSACTIONS.length, icon: 'bi-calendar-check', color: '#00e676' },
            ].map(s => (
              <div key={s.label} className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--nexa-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--nexa-gray-500)' }}>{s.label}</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: s.color }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Earnings by Transaction</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 120 }}>
              {TRANSACTIONS.map(t => (
                <div key={t.ref} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--nexa-gray-500)' }}>${t.net.toFixed(0)}</span>
                  <div style={{ width: '100%', height: `${(t.net / maxNet) * 90}px`, background: 'linear-gradient(180deg, var(--nexa-lsr), rgba(255,193,7,0.4))', borderRadius: '6px 6px 0 0' }}></div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--nexa-gray-600)', textAlign: 'center', lineHeight: 1.2 }}>{t.guest}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction table */}
          <div className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="dash-card-title" style={{ margin: 0 }}>Transactions</h3>
              <button className="btn btn-nexa-outline btn-nexa-sm"><i className="bi bi-download me-1"></i>Export CSV</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="lsr-tx-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--nexa-border)', color: 'var(--nexa-gray-500)' }}>
                    {['Date','Reference','Listing','Guest','Gross','Fee','Net'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map(t => (
                    <tr key={t.ref} style={{ borderBottom: '1px solid var(--nexa-border)' }}>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)' }}>{t.date}</td>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-lsr)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.ref}</td>
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
          </div>

          {/* Payout card */}
          <div className="dash-card" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nexa-gray-500)' }}>Next payout</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexa-lsr)' }}>${total.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nexa-gray-500)' }}>Estimated Jun 15, 2025 · Bank of America ···4512</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-nexa-outline btn-nexa-sm">Edit Bank Account</button>
              <button className="btn btn-nexa btn-nexa-sm">Request Early Payout</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
