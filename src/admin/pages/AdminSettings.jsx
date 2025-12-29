import { useState } from 'react';
import { Save, Shield, Key, Database, Bell, Mail, Globe } from 'lucide-react';
import './AdminSettings.css';

function AdminSettings() {
    const [settings, setSettings] = useState({
        siteName: 'Guri24',
        siteDescription: 'Premium Real Estate Platform in Kenya',
        contactEmail: 'info@guri24.com',
        contactPhone: '+254 706 070 747',
        address: 'Nairobi, Kenya',

        // Security
        sessionTimeout: '30',
        maxLoginAttempts: '5',
        twoFactorEnabled: true,
        ipWhitelist: '',

        // Email
        emailProvider: 'smtp',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',

        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
    });

    const [activeTab, setActiveTab] = useState('general');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        console.log('Saving settings:', settings);
        // API call to save settings
    };

    return (
        <div className="admin-settings">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your platform configuration and preferences</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={20} />
                    Save Changes
                </button>
            </div>

            {/* Settings Tabs */}
            <div className="settings-tabs">
                <button
                    className={`tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <Globe size={18} />
                    General
                </button>
                <button
                    className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Shield size={18} />
                    Security
                </button>
                <button
                    className={`tab ${activeTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveTab('email')}
                >
                    <Mail size={18} />
                    Email
                </button>
                <button
                    className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell size={18} />
                    Notifications
                </button>
                <button
                    className={`tab ${activeTab === 'api' ? 'active' : ''}`}
                    onClick={() => setActiveTab('api')}
                >
                    <Key size={18} />
                    API Keys
                </button>
                <button
                    className={`tab ${activeTab === 'backup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('backup')}
                >
                    <Database size={18} />
                    Backup
                </button>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="settings-section">
                        <h2>General Settings</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Site Name</label>
                                <input
                                    type="text"
                                    name="siteName"
                                    value={settings.siteName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Site Description</label>
                                <textarea
                                    name="siteDescription"
                                    value={settings.siteDescription}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={settings.contactPhone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={settings.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                    <div className="settings-section">
                        <h2>Security Settings</h2>
                        <div className="settings-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Session Timeout (minutes)</label>
                                    <input
                                        type="number"
                                        name="sessionTimeout"
                                        value={settings.sessionTimeout}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Max Login Attempts</label>
                                    <input
                                        type="number"
                                        name="maxLoginAttempts"
                                        value={settings.maxLoginAttempts}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="twoFactorEnabled"
                                        checked={settings.twoFactorEnabled}
                                        onChange={handleChange}
                                    />
                                    <span>Enable Two-Factor Authentication</span>
                                </label>
                                <p className="form-help">Require 2FA for all admin users</p>
                            </div>

                            <div className="form-group">
                                <label>IP Whitelist (one per line)</label>
                                <textarea
                                    name="ipWhitelist"
                                    value={settings.ipWhitelist}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="192.168.1.1&#10;10.0.0.1"
                                />
                                <p className="form-help">Only allow admin access from these IP addresses</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Email Settings */}
                {activeTab === 'email' && (
                    <div className="settings-section">
                        <h2>Email Configuration</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Email Provider</label>
                                <select name="emailProvider" value={settings.emailProvider} onChange={handleChange}>
                                    <option value="smtp">SMTP</option>
                                    <option value="sendgrid">SendGrid</option>
                                    <option value="mailgun">Mailgun</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>SMTP Host</label>
                                    <input
                                        type="text"
                                        name="smtpHost"
                                        value={settings.smtpHost}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>SMTP Port</label>
                                    <input
                                        type="text"
                                        name="smtpPort"
                                        value={settings.smtpPort}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>SMTP Username</label>
                                <input
                                    type="text"
                                    name="smtpUser"
                                    value={settings.smtpUser}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                    <div className="settings-section">
                        <h2>Notification Preferences</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="emailNotifications"
                                        checked={settings.emailNotifications}
                                        onChange={handleChange}
                                    />
                                    <span>Email Notifications</span>
                                </label>
                                <p className="form-help">Receive email alerts for important events</p>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="smsNotifications"
                                        checked={settings.smsNotifications}
                                        onChange={handleChange}
                                    />
                                    <span>SMS Notifications</span>
                                </label>
                                <p className="form-help">Receive SMS alerts for critical events</p>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="pushNotifications"
                                        checked={settings.pushNotifications}
                                        onChange={handleChange}
                                    />
                                    <span>Push Notifications</span>
                                </label>
                                <p className="form-help">Receive browser push notifications</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* API Keys */}
                {activeTab === 'api' && (
                    <div className="settings-section">
                        <h2>API Keys</h2>
                        <div className="api-keys-list">
                            <div className="api-key-item">
                                <div className="api-key-info">
                                    <span className="api-key-name">Production API Key</span>
                                    <code className="api-key-value">guri24_prod_••••••••••••••••</code>
                                </div>
                                <button className="btn btn-secondary">Regenerate</button>
                            </div>
                            <div className="api-key-item">
                                <div className="api-key-info">
                                    <span className="api-key-name">Development API Key</span>
                                    <code className="api-key-value">guri24_dev_••••••••••••••••</code>
                                </div>
                                <button className="btn btn-secondary">Regenerate</button>
                            </div>
                        </div>
                        <button className="btn btn-primary">
                            <Key size={18} />
                            Generate New Key
                        </button>
                    </div>
                )}

                {/* Backup */}
                {activeTab === 'backup' && (
                    <div className="settings-section">
                        <h2>Backup & Restore</h2>
                        <div className="backup-section">
                            <div className="backup-card">
                                <h3>Database Backup</h3>
                                <p>Last backup: January 28, 2025 at 3:00 AM</p>
                                <div className="backup-actions">
                                    <button className="btn btn-primary">Create Backup Now</button>
                                    <button className="btn btn-secondary">Download Latest</button>
                                </div>
                            </div>

                            <div className="backup-card">
                                <h3>Automatic Backups</h3>
                                <p>Schedule automatic database backups</p>
                                <select className="backup-schedule">
                                    <option>Daily at 3:00 AM</option>
                                    <option>Every 12 hours</option>
                                    <option>Weekly</option>
                                    <option>Disabled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminSettings;
