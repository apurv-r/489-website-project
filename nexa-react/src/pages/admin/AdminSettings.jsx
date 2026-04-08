import AdminSidebar from '../../components/AdminSidebar';

function SettingRow({ label, sub, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--nexa-border)' }}>
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{label}</p>
        {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--nexa-gray-500)' }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ defaultChecked }) {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
      <input type="checkbox" defaultChecked={defaultChecked} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: defaultChecked ? 'var(--nexa-primary)' : 'var(--nexa-surface-2)',
        transition: '0.2s',
      }}>
        <span style={{
          position: 'absolute', left: defaultChecked ? 22 : 2, top: 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: '0.2s',
        }}></span>
      </span>
    </label>
  );
}

export default function AdminSettings() {
  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <h1 className="adm-page-title">Settings</h1>
          <p className="adm-page-sub">Platform-wide configuration and admin preferences.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Platform settings */}
          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Platform</h3>
            <SettingRow label="Platform Name" sub="Displayed in the app header">
              <input defaultValue="NEXA" style={{ width: 140, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-bg)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }} />
            </SettingRow>
            <SettingRow label="Service Fee (%)" sub="Applied to each booking">
              <input type="number" defaultValue="10" style={{ width: 80, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-bg)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }} />
            </SettingRow>
            <SettingRow label="Min. Listing Price" sub="Per day, USD">
              <input type="number" defaultValue="5" style={{ width: 80, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-bg)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }} />
            </SettingRow>
            <SettingRow label="Max. Photos Per Listing" sub="Upload limit">
              <input type="number" defaultValue="12" style={{ width: 80, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-bg)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }} />
            </SettingRow>
          </div>

          {/* Registration & Auth */}
          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Registration &amp; Auth</h3>
            <SettingRow label="Allow New Registrations" sub="Disable to freeze sign-ups">
              <Toggle defaultChecked={true} />
            </SettingRow>
            <SettingRow label="Email Verification Required" sub="Before first booking">
              <Toggle defaultChecked={true} />
            </SettingRow>
            <SettingRow label="Host Auto-Approval" sub="Bypass verification queue">
              <Toggle defaultChecked={false} />
            </SettingRow>
            <SettingRow label="Two-Factor Auth (Admin)" sub="For admin portal logins">
              <Toggle defaultChecked={true} />
            </SettingRow>
          </div>

          {/* Notifications */}
          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Notifications</h3>
            <SettingRow label="Email on New Report" sub="Alert admins via email">
              <Toggle defaultChecked={true} />
            </SettingRow>
            <SettingRow label="Email on New Listing" sub="Alert on submission">
              <Toggle defaultChecked={false} />
            </SettingRow>
            <SettingRow label="Daily Summary Email" sub="Sent at 8 AM UTC">
              <Toggle defaultChecked={true} />
            </SettingRow>
            <SettingRow label="Admin Notification Email" sub="Recipient address">
              <input defaultValue="ops@nexa.com" style={{ width: 160, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-bg)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }} />
            </SettingRow>
          </div>

          {/* Moderation */}
          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Moderation</h3>
            <SettingRow label="Auto-Suspend on 3 Reports" sub="Temporary suspension">
              <Toggle defaultChecked={true} />
            </SettingRow>
            <SettingRow label="Listing Hold on Report" sub="Pause listing while reviewing">
              <Toggle defaultChecked={false} />
            </SettingRow>
            <SettingRow label="Report Cooldown (days)" sub="Per user per listing">
              <input type="number" defaultValue="7" style={{ width: 80, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--nexa-border)', background: 'var(--nexa-bg)', color: 'var(--nexa-gray-200)', fontSize: '0.875rem' }} />
            </SettingRow>
            <SettingRow label="Maintenance Mode" sub="Blocks all user access">
              <Toggle defaultChecked={false} />
            </SettingRow>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
          <button className="btn btn-nexa-outline">Reset to Defaults</button>
          <button className="btn btn-nexa"><i className="bi bi-save2 me-2"></i>Save Settings</button>
        </div>
      </main>
    </div>
  );
}
