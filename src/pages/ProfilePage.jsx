import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit2, Save, X, LogOut, Heart, Home, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSavedProperties, getUserStats } from '../utils/api';
import { propertyApi } from '../utils/propertyApi';
import PropertyCard from '../components/PropertyCard';
import './ProfilePage.css';

function ProfilePage() {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Saved Properties State
    const [savedProperties, setSavedProperties] = useState([]);
    const [stats, setStats] = useState({
        saved_properties: 0,
        properties_viewed: 0,
        scheduled_visits: 0
    });
    const [loadingSaved, setLoadingSaved] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
    });

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [properties, userStats, myBookings] = await Promise.all([
                    getSavedProperties(),
                    getUserStats(),
                    propertyApi.getMyBookings()
                ]);
                setSavedProperties(properties);
                setStats(userStats);
                setBookings(myBookings);
            } catch (err) {
                console.error("Failed to fetch profile data", err);
            } finally {
                setLoadingSaved(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // ... existing handlers ...

    // ... render return ...

    {/* Activity Stats */ }
    <div className="profile-section">
        <h2>Activity</h2>
        <div className="activity-stats">
            <div className="stat-card">
                <div className="stat-icon">
                    <Heart size={24} />
                </div>
                <div className="stat-info">
                    <h3>{stats.saved_properties}</h3>
                    <p>Saved Properties</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <Home size={24} />
                </div>
                <div className="stat-info">
                    <h3>{stats.properties_viewed}</h3>
                    <p>Properties Viewed</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <Calendar size={24} />
                </div>
                <div className="stat-info">
                    <h3>{stats.scheduled_visits}</h3>
                    <p>Scheduled Visits</p>
                </div>
            </div>
        </div>
    </div>

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const result = await updateProfile(formData);

        if (result.success) {
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to update profile');
        }

        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.bio || '',
        });
        setIsEditing(false);
        setError('');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="avatar-edit-btn" title="Change photo">
                            <Edit2 size={16} />
                        </button>
                    </div>
                    <div className="profile-header-info">
                        <h1>{user?.name || 'User'}</h1>
                        <p className="profile-email">{user?.email}</p>
                        <div className="profile-badges">
                            <span className="badge">Member since {new Date().getFullYear()}</span>
                        </div>
                    </div>
                    <div className="profile-actions">
                        {!isEditing ? (
                            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        ) : (
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                <X size={18} />
                                Cancel
                            </button>
                        )}
                        <button className="btn btn-outline-danger" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Profile Content */}
                <div className="profile-content">
                    {/* Personal Information */}
                    <div className="profile-section">
                        <h2>Personal Information</h2>
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <div className="input-wrapper">
                                        <User size={20} className="input-icon" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail size={20} className="input-icon" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <div className="input-wrapper">
                                        <Phone size={20} className="input-icon" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">Location</label>
                                    <div className="input-wrapper">
                                        <MapPin size={20} className="input-icon" />
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            placeholder="City, Country"
                                            value={formData.location}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows="4"
                                    placeholder="Tell us about yourself..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            'Saving...'
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Activity Stats */}
                    <div className="profile-section">
                        <h2>Activity</h2>
                        <div className="activity-stats">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Heart size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.saved_properties}</h3>
                                    <p>Saved Properties</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Home size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.properties_viewed}</h3>
                                    <p>Properties Viewed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Calendar size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.scheduled_visits}</h3>
                                    <p>Scheduled Visits</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Bookings */}
                    <div className="profile-section">
                        <h2>My Bookings</h2>
                        {loadingSaved ? (
                            <p>Loading bookings...</p>
                        ) : bookings.length > 0 ? (
                            <div className="bookings-list">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="booking-card">
                                        <div className="booking-info">
                                            <div className="booking-header">
                                                <h3>Booking #{booking.id.slice(0, 8)}</h3>
                                                <span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                                            </div>
                                            <div className="booking-details">
                                                <div className="detail-row">
                                                    <Calendar size={16} />
                                                    <span>{new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <Home size={16} />
                                                    <span>{booking.guest_count} Guest{booking.guest_count > 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="detail-row price">
                                                    <span>Total: </span>
                                                    <strong>KSh {parseFloat(booking.total_price).toLocaleString()}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Calendar size={48} />
                                <p>You haven't made any bookings yet</p>
                                <button className="btn btn-primary" onClick={() => navigate('/stays')}>
                                    Find a Stay
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Saved Properties */}
                    <div className="profile-section">
                        <h2>Saved Properties</h2>
                        {loadingSaved ? (
                            <p>Loading saved properties...</p>
                        ) : savedProperties.length > 0 ? (
                            <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                {savedProperties.map(property => (
                                    <PropertyCard key={property.id} property={property} initialSaved={true} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Heart size={48} />
                                <p>You haven't saved any properties yet</p>
                                <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                                    Browse Properties
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
