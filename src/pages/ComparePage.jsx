import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { Check, X, ArrowLeft, Trash2, MapPin, Bed, Bath, Square } from 'lucide-react';
import { formatPrice } from '../utils/propertyApi';
import './ComparePage.css';

function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) {
        return (
            <div className="compare-empty">
                <div className="container">
                    <h2>No properties to compare</h2>
                    <p>Select properties from the listings to see them side by side.</p>
                    <Link to="/listings" className="btn btn-primary">
                        <ArrowLeft size={18} />
                        Browse Properties
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="compare-page">
            <div className="container">
                <div className="compare-header-page">
                    <h1>Compare Properties</h1>
                    <button className="btn btn-outline" onClick={clearCompare}>
                        <Trash2 size={18} />
                        Clear All
                    </button>
                </div>

                <div className="compare-table-wrapper">
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th className="feature-label">Feature</th>
                                {compareList.map(property => (
                                    <th key={property.id} className="property-col">
                                        <button
                                            className="remove-prop-btn"
                                            onClick={() => removeFromCompare(property.id)}
                                            title="Remove"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="prop-header-info">
                                            <Link to={`/property/${property.slug}`}>
                                                <img src={property.images[0]} alt={property.title} />
                                            </Link>
                                            <Link to={`/property/${property.slug}`} className="prop-title">
                                                {property.title}
                                            </Link>
                                            <div className="prop-price">
                                                {formatPrice(property.price, property.currency)}
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="feature-label">Location</td>
                                {compareList.map(property => (
                                    <td key={property.id}>
                                        <div className="td-content">
                                            <MapPin size={16} className="text-primary" />
                                            {property.location.city}, {property.location.country}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Type</td>
                                {compareList.map(property => (
                                    <td key={property.id} className="capitalize">{property.type}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Purpose</td>
                                {compareList.map(property => (
                                    <td key={property.id}>
                                        <span className={`badge ${property.purpose.toLowerCase()}`}>
                                            {property.purpose}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Bedrooms</td>
                                {compareList.map(property => (
                                    <td key={property.id}>
                                        <div className="td-content">
                                            <Bed size={16} className="text-secondary" />
                                            {property.bedrooms || '-'}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Bathrooms</td>
                                {compareList.map(property => (
                                    <td key={property.id}>
                                        <div className="td-content">
                                            <Bath size={16} className="text-secondary" />
                                            {property.bathrooms || '-'}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Size</td>
                                {compareList.map(property => (
                                    <td key={property.id}>
                                        <div className="td-content">
                                            <Square size={16} className="text-secondary" />
                                            {property.size}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            {/* Amenities Comparison if available */}
                            <tr>
                                <td className="feature-label">Amenities</td>
                                {compareList.map(property => (
                                    <td key={property.id}>
                                        <div className="amenities-list">
                                            {(Array.isArray(property.features) ? property.features : []).slice(0, 5).map((feature, idx) => (
                                                <div key={idx} className="amenity-item">
                                                    <Check size={14} className="text-success" />
                                                    {feature}
                                                </div>
                                            ))}
                                            {(Array.isArray(property.features) ? property.features : []).length > 5 && (
                                                <span className="more-amenities">+{(Array.isArray(property.features) ? property.features : []).length - 5} more</span>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Action</td>
                                {compareList.map(property => (
                                    <td key={property.id}>
                                        <Link to={`/property/${property.slug}`} className="btn btn-primary btn-sm btn-block">
                                            View Details
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ComparePage;
