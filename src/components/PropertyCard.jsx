import { useState } from 'react'; // Add useState
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { Star, Heart, Info, Plus, Check } from 'lucide-react';
import { formatPrice } from '../utils/propertyApi';
import analytics from '../utils/analytics';
import './PropertyCard.css';
import { useAuth } from '../context/AuthContext'; // Import Auth
import { saveProperty, unsaveProperty } from '../utils/api'; // Import API

import { useCompare } from '../context/CompareContext';

function PropertyCard({ property, initialSaved = false }) { // Accept initialSaved
    const { slug, title, type, price, currency, priceUnit, location, images } = property;
    const rating = (4.5 + Math.random() * 0.5).toFixed(2);

    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);

    // Use Context
    const { toggleCompare, isInCompare } = useCompare();
    const isSelected = isInCompare(property.id);

    const handlePropertyClick = () => {
        analytics.trackPropertyCardAction('details', slug);
    };

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop navigation

        if (!user) {
            // Redirect to login if not authenticated
            navigate('/login');
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            if (isSaved) {
                await unsaveProperty(property.id);
                setIsSaved(false);
                analytics.trackPropertyCardAction('unsave', slug);
            } else {
                await saveProperty(property.id);
                setIsSaved(true);
                analytics.trackPropertyCardAction('save', slug);
            }
        } catch (error) {
            console.error('Failed to update favorite status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        analytics.trackPropertyCardAction('compare', slug);
        toggleCompare(property);
    };

    return (
        <div className={`property-card ${isSelected ? 'is-comparing' : ''}`}> {/* Add class if selected */}
            <div className="property-image-container">
                <Link to={`/property/${slug}`} onClick={handlePropertyClick}>
                    <img src={images[0]} alt={title} loading="lazy" />
                </Link>
                <button className={`favorite-btn-overlay ${isSaved ? 'active' : ''}`} onClick={handleFavoriteClick} disabled={loading}>
                    <Heart size={20} color={isSaved ? "#ef4444" : "white"} fill={isSaved ? "#ef4444" : "rgba(0,0,0,0.5)"} />
                </button>
                <div className="badge-overlay">{type}</div>
            </div>

            <div className="property-info">
                <Link to={`/property/${slug}`} className="info-header-link" onClick={handlePropertyClick}>
                    <div className="info-header">
                        <h3 className="location-title">{location.city}, {location.country}</h3>
                        <div className="rating">
                            <Star size={14} fill="black" />
                            <span>{rating}</span>
                        </div>
                    </div>

                    <p className="description-text text-secondary">Viewed {property.views || Math.floor(Math.random() * 50) + 10} times last week</p>
                    <p className="description-text text-secondary">{title}</p>
                </Link>

                <div className="card-footer">
                    <div className="price-container">
                        <span className="price-amount">{formatPrice(price, currency)}</span>
                        <span className="price-unit">{priceUnit ? ` ${priceUnit}` : ''}</span>
                    </div>

                    <div className="card-actions">
                        <Link to={`/property/${slug}`} className="icon-btn" title="View Details" onClick={handlePropertyClick}>
                            <Info size={18} />
                        </Link>
                        <button
                            className={`icon-btn ${isSelected ? 'active-compare' : ''}`}
                            title={isSelected ? "Remove from Compare" : "Add to Compare"}
                            onClick={handleCompareClick}
                        >
                            {isSelected ? <Check size={18} /> : <Plus size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyCard;
