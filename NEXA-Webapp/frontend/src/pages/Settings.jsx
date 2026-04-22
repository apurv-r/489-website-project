import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HostSidebar from '../components/HostSidebar';
import LesseeSidebar from '../components/LesseeSidebar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });
  const avatarInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        const u = response.data.user;
        setUser(u);
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setEmail(u.email || '');
        setProfilePictureUrl(u.profilePictureUrl || '');
      } catch (err) {
        setProfileMsg({ type: 'error', text: 'Failed to load user data.' });
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/users/${user._id}`,
        { firstName, lastName, email },
        {
          withCredentials: true,
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }
      );
      setProfileMsg({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/users/${user._id}`,
        { password: newPassword },
        {
          withCredentials: true,
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }
      );
      setPasswordMsg({ type: 'success', text: 'Password updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleAvatarUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarMsg({ type: 'error', text: 'Please select an image file.' });
      return;
    }
    setAvatarUploading(true);
    setAvatarMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      const formData = new FormData();
      formData.append('images', file);
      const uploadRes = await axios.post(`${API_BASE_URL}/api/uploads/images`, formData, { withCredentials: true, headers });
      const url = uploadRes.data?.files?.[0]?.url;
      if (!url) throw new Error('Upload failed.');

      await axios.put(`${API_BASE_URL}/api/users/${user._id}`, { profilePictureUrl: url }, { withCredentials: true, headers });
      setProfilePictureUrl(url);
      setAvatarMsg({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setAvatarMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload picture.' });
    } finally {
      setAvatarUploading(false);
    }
  }

  const isHost = user?.roleType === 'Host';
  const Sidebar = isHost ? HostSidebar : LesseeSidebar;

  if (loading) {
    return (
      <div className="dash-page">
        <Navbar variant="dashboard" />
        <div className="dash-layout">
          <Sidebar />
          <main className="dash-main">
            <p style={{ color: 'var(--nexa-gray-400)', padding: '2rem' }}>Loading…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <Sidebar {...user}/>
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">Settings</h1>
              <p className="dash-page-sub">Manage your account details.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 640 }}>

            {/* Profile Picture */}
            <div className="dash-card">
              <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Profile Picture</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <img
                  src={profilePictureUrl || 'https://i.pravatar.cc/80?img=14'}
                  alt="Profile"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--nexa-border)' }}
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarInputRef}
                    style={{ display: 'none' }}
                    onChange={e => handleAvatarUpload(e.target.files[0])}
                  />
                  <button className="btn btn-nexa-outline" onClick={() => avatarInputRef.current.click()} disabled={avatarUploading}>
                    {avatarUploading ? 'Uploading…' : 'Change Photo'}
                  </button>
                  {avatarMsg.text && (
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: avatarMsg.type === 'success' ? '#4caf50' : '#ff6b6b' }}>
                      <i className={`bi ${avatarMsg.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-1`}></i>
                      {avatarMsg.text}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="dash-card">
              <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Profile</h3>
              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="lsr-label">First name</label>
                    <input className="lsr-input" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="lsr-label">Last name</label>
                    <input className="lsr-input" type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lsr-label">Email address</label>
                  <input className="lsr-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {profileMsg.text && (
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: profileMsg.type === 'success' ? '#4caf50' : '#ff6b6b' }}>
                    <i className={`bi ${profileMsg.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-1`}></i>
                    {profileMsg.text}
                  </p>
                )}
                <button type="submit" className="btn btn-nexa" disabled={profileSaving}>
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Password */}
            <div className="dash-card">
              <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Change Password</h3>
              <form onSubmit={handlePasswordSave}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lsr-label">New password</label>
                  <input className="lsr-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lsr-label">Confirm new password</label>
                  <input className="lsr-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" required />
                </div>
                {passwordMsg.text && (
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: passwordMsg.type === 'success' ? '#4caf50' : '#ff6b6b' }}>
                    <i className={`bi ${passwordMsg.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-1`}></i>
                    {passwordMsg.text}
                  </p>
                )}
                <button type="submit" className="btn btn-nexa" disabled={passwordSaving}>
                  {passwordSaving ? 'Saving…' : 'Update Password'}
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
