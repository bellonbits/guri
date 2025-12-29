import { useState } from 'react';
import { MapPin, Phone, Mail, Globe, Send, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';
import Map from '../components/Map';
import './ContactPage.css';

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
    };

    // Westpark Towers approximate coordinates
    const officeLocation = { lat: -1.2649, lng: 36.8066 };

    return (
        <div className="contact-page">
            {/* Hero */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="contact-hero-content">
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you! Get in touch with us today.</p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="contact-content">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Info */}
                        <div className="contact-info">
                            <h2>Need More Information?</h2>
                            <p>Have questions or need help finding the right property? Our team is here to assist you every step of the way.</p>

                            <div className="info-cards">
                                <div className="info-card">
                                    <div className="card-icon">
                                        <Phone size={24} />
                                    </div>
                                    <div className="card-content">
                                        <h4>Phone</h4>
                                        <a href="tel:+254706070747">+254 706 070 747</a>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="card-icon">
                                        <Mail size={24} />
                                    </div>
                                    <div className="card-content">
                                        <h4>Email</h4>
                                        <a href="mailto:support@guri24.com">support@guri24.com</a>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="card-icon">
                                        <Globe size={24} />
                                    </div>
                                    <div className="card-content">
                                        <h4>Website</h4>
                                        <a href="https://guri24.com" target="_blank" rel="noopener noreferrer">www.guri24.com</a>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="card-icon">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="card-content">
                                        <h4>Office</h4>
                                        <span>Westpark Towers Suite 503<br />Off Muthithi Road, Nairobi</span>
                                    </div>
                                </div>
                            </div>

                            <div className="social-section">
                                <h4>Follow Us</h4>
                                <div className="social-links">
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                        <Facebook size={20} />
                                    </a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                        <Twitter size={20} />
                                    </a>
                                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                                        <Youtube size={20} />
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                        <Instagram size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-wrapper">
                            <h2>Get In Touch</h2>
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Your Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+254 7XX XXX XXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <input
                                            type="text"
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Your Message</label>
                                    <textarea
                                        rows="5"
                                        placeholder="Tell us more about your inquiry..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    <Send size={18} />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <div className="container">
                    <div className="map-header">
                        <h2>Visit Our Office</h2>
                        <p>Westpark Towers, Westlands, Nairobi</p>
                    </div>
                    <Map
                        lat={officeLocation.lat}
                        lng={officeLocation.lng}
                        zoom={16}
                        popupText="Guri24 Office - Westpark Towers"
                        height="450px"
                    />
                </div>
            </section>
        </div>
    );
}

export default ContactPage;
