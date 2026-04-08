import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const USERS = [
  { id: 1, name: 'Marcus Thompson', email: 'marcus@email.com', role: 'Driver',  joined: 'Jan 12, 2025', bookings: 12, status: 'Active' },
  { id: 2, name: 'Sarah Kim',       email: 'sarah@email.com',  role: 'Driver',  joined: 'Feb 3, 2025',  bookings: 5,  status: 'Active' },
  { id: 3, name: 'Kevin Scott',     email: 'kevin@email.com',  role: 'Host',    joined: 'Dec 8, 2024',  bookings: 0,  status: 'Active' },
  { id: 4, name: 'Maria Lopez',     email: 'maria@email.com',  role: 'Host',    joined: 'Nov 15, 2024', bookings: 0,  status: 'Active' },
  { id: 5, name: 'James Rivera',    email: 'james@email.com',  role: 'Driver',  joined: 'Mar 22, 2025', bookings: 3,  status: 'Active' },
  { id: 6, name: 'Priya Mehta',     email: 'priya@email.com',  role: 'Driver',  joined: 'Apr 10, 2025', bookings: 4,  status: 'Active' },
  { id: 7, name: 'David Lee',       email: 'david@email.com',  role: 'Driver',  joined: 'May 1, 2025',  bookings: 2,  status: 'Suspended' },
  { id: 8, name: 'Nina Brown',      email: 'nina@email.com',   role: 'Host',    joined: 'Mar 5, 2025',  bookings: 0,  status: 'Pending' },
];

const ROLES = ['All', 'Driver', 'Host'];
const STATUSES = ['All', 'Active', 'Suspended', 'Pending'];

const STATUS_STYLE = {
  Active:    { bg: 'rgba(0,230,118,0.12)',   color: '#00e676' },
  Suspended: { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b' },
  Pending:   { bg: 'rgba(253,200,65,0.12)',  color: '#fdc841' },
};

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = USERS.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (statusFilter === 'All' || u.status === statusFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <h1 className="adm-page-title">Users</h1>
          <p className="adm-page-sub">Manage all drivers and hosts on the platform.</p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 200px', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-surface)', color: 'var(--nexa-gray-200)', outline: 'none', fontSize: '0.875rem' }}
          />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-surface)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-surface)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="adm-card">
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--nexa-border)', color: 'var(--nexa-gray-500)' }}>
                {['Name','Email','Role','Joined','Bookings','Status',''].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const st = STATUS_STYLE[u.status] || STATUS_STYLE.Active;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--nexa-border)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)', fontSize: '0.8rem' }}>{u.email}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <span style={{ padding: '0.2em 0.7em', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: u.role === 'Host' ? 'rgba(253,200,65,0.12)' : 'rgba(116,185,255,0.12)', color: u.role === 'Host' ? '#fdc841' : '#74b9ff' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)', fontSize: '0.8rem' }}>{u.joined}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{u.bookings}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <span style={{ padding: '0.2em 0.7em', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: st.bg, color: st.color }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <Link to="/admin/user-detail" className="btn btn-nexa-outline btn-nexa-sm">View</Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--nexa-gray-500)' }}>No users match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
