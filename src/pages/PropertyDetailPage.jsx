import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import analytics from '../utils/analytics';
import { MapPin, Bed, Bath, Square, Phone, Mail, ChevronLeft, ChevronRight, Heart, Share2, Check, Calendar } from 'lucide-react';
import { propertyApi, transformProperty, formatPrice } from '../utils/propertyApi';
import PropertyCard from '../components/PropertyCard';
import Map from '../components/Map';
import { useAuth } from '../context/AuthContext';
import { trackUserView, createInquiry } from '../utils/api';
import './PropertyDetailPage.css';

function PropertyDetailPage() {
    const { slug } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProperties, setRelatedProperties] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);

    // Auth & Form State
    const { user } = useAuth();
    const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    // Fetch property by slug
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const data = await propertyApi.getPropertyBySlug(slug);
                const transformed = transformProperty(data);
                setProperty(transformed);

                // Fetch related properties (same type)
                const relatedResponse = await propertyApi.getPropertiesByType(data.type, 1, 4);
                const relatedTransformed = relatedResponse.properties
                    .filter(p => p.slug !== slug)
                    .map(transformProperty)
                    .slice(0, 3);
                setRelatedProperties(relatedTransformed);
            } catch (error) {
                console.error('Failed to fetch property:', error);
                setProperty(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [slug]);

    // Track property view (Analytics + User History)
    useEffect(() => {
        if (property) {
            analytics.trackPropertyView(property);

            // Track for user history if logged in
            if (user && property.id) {
                trackUserView(property.id).catch(err => console.log("View tracking optional/failed:", err));
            }
        }
    }, [property, user]);

    // Pre-fill form if user exists
    useEffect(() => {
        if (user) {
            setInquiryForm(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    if (!property) {
        return (
            <div className="not-found">
                <div className="container">
                    <h1>Property Not Found</h1>
                    <p>The property you're looking for doesn't exist.</p>
                    <Link to="/listings" className="btn btn-primary">View All Listings</Link>
                </div>
            </div>
        );
    }

    const handleInquiryChange = (e) => {
        setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
    };

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createInquiry({
                ...inquiryForm,
                property_id: property.id,
                message: inquiryForm.message || "I am interested in this property."
            });
            alert('Request sent successfully!');
            setShowContactForm(false);
            setInquiryForm({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error("Inquiry failed", error);
            alert("Failed to send request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };



    // ... helper functions ...
    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % property.images.length);
    };

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
    };

    return (
        <div className="property-detail-page">
            {/* Image Gallery */}
            <section className="gallery-section">
                <div className="gallery-main">
                    <img src={property.images[currentImage]} alt={property.title} />
                    <div className="gallery-nav">
                        <button onClick={prevImage} aria-label="Previous image">
                            <ChevronLeft size={24} />
                        </button>
                        <span>{currentImage + 1} / {property.images.length}</span>
                        <button onClick={nextImage} aria-label="Next image">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    <div className="gallery-actions">
                        <button className="action-btn" aria-label="Add to favorites">
                            <Heart size={20} />
                        </button>
                        <button className="action-btn" aria-label="Share">
                            <Share2 size={20} />
                        </button>
                    </div>
                    <div className="gallery-badge">
                        <span className={property.purpose.toLowerCase()}>{property.purpose}</span>
                    </div>
                </div>
                <div className="gallery-thumbs">
                    {property.images.map((img, index) => (
                        <button
                            key={index}
                            className={`thumb ${index === currentImage ? 'active' : ''}`}
                            onClick={() => setCurrentImage(index)}
                        >
                            <img src={img} alt={`${property.title} ${index + 1}`} />
                        </button>
                    ))}
                </div>
            </section>

            {/* Content */}
            <section className="detail-content">
                <div className="container">
                    <div className="detail-grid">
                        <div className="detail-main">
                            <div className="detail-header">
                                <div>
                                    <h1>{property.title}</h1>
                                    <div className="location">
                                        <MapPin size={18} />
                                        <span>{property.location.area}, {property.location.city}, {property.location.country}</span>
                                    </div>
                                </div>
                                <div className="price">
                                    {formatPrice(property.price, property.currency, property.priceUnit)}
                                </div>
                            </div>

                            <div className="property-stats">
                                {property.bedrooms > 0 && (
                                    <div className="stat">
                                        <Bed size={22} />
                                        <span>{property.bedrooms} Bedrooms</span>
                                    </div>
                                )}
                                {property.bathrooms > 0 && (
                                    <div className="stat">
                                        <Bath size={22} />
                                        <span>{property.bathrooms} Bathrooms</span>
                                    </div>
                                )}
                                <div className="stat">
                                    <Square size={22} />
                                    <span>{property.size}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h2>Description</h2>
                                <p>{property.description}</p>
                            </div>

                            <div className="detail-section">
                                <h2>Features & Amenities</h2>
                                <div className="features-grid">
                                    {property.features.map((feature, index) => (
                                        <div key={index} className="feature-item">
                                            <Check size={18} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Location Map */}
                            {property.coordinates && (
                                <div className="detail-section">
                                    <h2>Location</h2>
                                    <div style={{ marginTop: '20px' }}>
                                        <Map
                                            lat={property.coordinates.lat}
                                            lng={property.coordinates.lng}
                                            popupText={property.title}
                                            zoom={15}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="detail-sidebar">
                            <div className="agent-card">
                                <h3>Contact Agent</h3>
                                <div className="agent-info">
                                    <div className="agent-avatar">
                                        <span>{property.agent.name.charAt(0)}</span>
                                    </div>
                                    <div className="agent-details">
                                        <strong>{property.agent.name}</strong>
                                        <span>Property Agent</span>
                                    </div>
                                </div>
                                <div className="agent-contacts">
                                    <a href={`tel:${property.agent.phone}`} className="btn btn-primary">
                                        <Phone size={18} />
                                        Call Now
                                    </a>
                                    <a href={`mailto:${property.agent.email}`} className="btn btn-secondary">
                                        <Mail size={18} />
                                        Email
                                    </a>
                                </div>
                                <button
                                    className="btn btn-outline-primary schedule-btn"
                                    onClick={() => setShowContactForm(!showContactForm)}
                                >
                                    <Calendar size={18} />
                                    Schedule a Visit
                                </button>

                                {showContactForm && (
                                    <form className="contact-form" onSubmit={handleInquirySubmit}>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your Name"
                                            value={inquiryForm.name}
                                            onChange={handleInquiryChange}
                                            required
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Your Email"
                                            value={inquiryForm.email}
                                            onChange={handleInquiryChange}
                                            required
                                        />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Your Phone"
                                            value={inquiryForm.phone}
                                            onChange={handleInquiryChange}
                                            required
                                        />
                                        <textarea
                                            name="message"
                                            placeholder="Message"
                                            rows="3"
                                            value={inquiryForm.message}
                                            onChange={handleInquiryChange}
                                        ></textarea>
                                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                                            {submitting ? 'Sending...' : 'Send Request'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Similar Properties */}
            {relatedProperties.length > 0 && (
                <section className="similar-section">
                    <div className="container">
                        <h2>Similar Properties</h2>
                        <div className="similar-grid">
                            {relatedProperties.map(prop => (
                                <PropertyCard key={prop.id} property={prop} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default PropertyDetailPage;
