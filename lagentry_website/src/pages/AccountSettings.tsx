import React from 'react';
import './AccountSettings.css';

const AccountSettings: React.FC = () => {
  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">Account Settings</h1>
        <p className="settings-subtitle">Manage your profile and preferences.</p>

        <div className="settings-grid">
          <section className="settings-section">
            <h3>Profile</h3>
            <div className="form-field"><label>Name</label><input placeholder="Your name" /></div>
            <div className="form-field"><label>Email</label><input placeholder="you@company.com" /></div>
            <div className="form-field"><label>Company</label><input placeholder="Company" /></div>
          </section>
          <section className="settings-section">
            <h3>Preferences</h3>
            <div className="form-field"><label>Timezone</label><input placeholder="e.g., UTC+5:30" /></div>
            <div className="form-field"><label>Language</label><input placeholder="English" /></div>
            <div className="form-field"><label>Notifications</label><input placeholder="Email" /></div>
          </section>
        </div>

        <div className="actions">
          <button className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;


