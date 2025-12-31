import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import analytics from '../utils/analytics';
import { MapPin, Bed, Bath, Square, Phone, Mail, ChevronLeft, ChevronRight, Heart, Share2, Check, Calendar, Star } from 'lucide-react';
import { propertyApi, transformProperty, formatPrice } from '../utils/propertyApi';
import PropertyCard from '../components/PropertyCard';
import Map from '../components/Map';
import ChatWidget from '../components/ChatWidget';
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

    // Booking State
    const [bookingDates, setBookingDates] = useState({ checkIn: '', checkOut: '' });
    const [guests, setGuests] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

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

            // Track for user history only if authenticated to avoid 401s
            if (user && property.id) {
                trackUserView(property.id).catch(err => {
                    // Silent fail for optional tracking
                });
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

    // Booking Handlers
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to book this property.");
            return;
        }

        if (!bookingDates.checkIn || !bookingDates.checkOut) {
            alert("Please select both check-in and check-out dates.");
            return;
        }

        const payload = {
            property_id: property.id,
            check_in: new Date(bookingDates.checkIn).toISOString(),
            check_out: new Date(bookingDates.checkOut).toISOString(),
            guest_count: guests
        };

        console.log("Sending Booking Payload:", payload);

        setSubmitting(true);
        try {
            await propertyApi.createBooking(payload);
            alert('Booking confirmed! Check your dashboard for details.');
            setBookingDates({ checkIn: '', checkOut: '' });
        } catch (error) {
            console.error("Booking failed", error);

            let errorMessage = "Booking failed. Please try again.";
            if (error.response) {
                if (error.response.status === 422 && Array.isArray(error.response.data.detail)) {
                    // Pydantic validation error
                    errorMessage = "Validation Error: " + error.response.data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                }
            }
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate total price when dates change
    useEffect(() => {
        if (bookingDates.checkIn && bookingDates.checkOut && property?.price) {
            const start = new Date(bookingDates.checkIn);
            const end = new Date(bookingDates.checkOut);
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (nights > 0) {
                setTotalPrice(nights * property.price);
            } else {
                setTotalPrice(0);
            }
        }
    }, [bookingDates, property]);

    const handleInquiryChange = (e) => {
        const { name, value } = e.target;
        setInquiryForm(prev => ({ ...prev, [name]: value }));
    };

    const handleInquirySubmit = async (e) => {
        e.preventDefault();

        if (inquiryForm.message.length < 10) {
            alert("Message must be at least 10 characters long.");
            return;
        }

        setSubmitting(true);
        try {
            await createInquiry({
                property_id: property.id,
                ...inquiryForm
            });
            alert('Your request has been sent! An agent will contact you soon.');
            setInquiryForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' });
            setShowContactForm(false);
        } catch (error) {
            console.error('Inquiry failed:', error);
            alert('Failed to send inquiry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

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
                            {property.purpose === 'Stay' ? (
                                <div className="booking-widget">
                                    <div className="booking-header">
                                        <div className="booking-price">
                                            <span className="amount">{formatPrice(property.price, property.currency)}</span>
                                            <span className="unit"> / night</span>
                                        </div>
                                        <div className="booking-rating">
                                            <Star size={14} fill="currentColor" />
                                            <span>4.9 (12 reviews)</span>
                                        </div>
                                    </div>

                                    <form className="booking-form" onSubmit={handleBookingSubmit}>
                                        <div className="date-picker-group">
                                            <div className="date-input">
                                                <label>CHECK-IN</label>
                                                <input
                                                    type="date"
                                                    value={bookingDates.checkIn}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setBookingDates({ ...bookingDates, checkIn: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="date-input">
                                                <label>CHECK-OUT</label>
                                                <input
                                                    type="date"
                                                    value={bookingDates.checkOut}
                                                    min={bookingDates.checkIn || new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setBookingDates({ ...bookingDates, checkOut: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="guest-picker">
                                            <label>GUESTS</label>
                                            <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))}>
                                                {[1, 2, 3, 4, 5, 6].map(n => (
                                                    <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button type="submit" className="btn btn-primary booking-btn" disabled={submitting}>
                                            {submitting ? 'Confirming...' : 'Reserve'}
                                        </button>

                                        <p className="no-charge-note">You won't be charged yet</p>

                                        {totalPrice > 0 && (
                                            <div className="price-breakdown">
                                                <div className="price-row">
                                                    <span>{formatPrice(property.price, property.currency)} x {Math.ceil((new Date(bookingDates.checkOut) - new Date(bookingDates.checkIn)) / (1000 * 60 * 60 * 24))} nights</span>
                                                    <span>{formatPrice(totalPrice, property.currency)}</span>
                                                </div>
                                                <div className="price-row">
                                                    <span>Service fee</span>
                                                    <span>{formatPrice(totalPrice * 0.05, property.currency)}</span>
                                                </div>
                                                <hr />
                                                <div className="price-row total">
                                                    <span>Total</span>
                                                    <span>{formatPrice(totalPrice * 1.05, property.currency)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            ) : (
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
                            )}
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
            {/* Chat Widget for Stays */}
            {property?.purpose === 'Stay' && (
                <ChatWidget
                    propertyId={property.id}
                    propertyTitle={property.title}
                    agentName={property.agent.name}
                />
            )}
        </div>
    );
}

export default PropertyDetailPage;
