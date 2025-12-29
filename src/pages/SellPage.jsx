import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Phone, Mail, User, Building, DollarSign, FileText, Send } from 'lucide-react';
import './SellPage.css';

function SellPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        location: '',
        price: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you! Our team will contact you shortly.');
    };

    return (
        <div className="sell-page">
            {/* Hero */}
            <section className="sell-hero">
                <div className="sell-hero-overlay"></div>
                <div className="sell-hero-content">
                    <h1>Sell Your Property</h1>
                    <p>Selling property doesn't have to be complicated. Let our experts help you get the best value.</p>
                </div>
            </section>

            {/* Benefits */}
            <section className="benefits-section">
                <div className="container">
                    <div className="section-title">
                        <h2>Why Sell With Guri24?</h2>
                        <p>Our professional agents provide the best service</p>
                    </div>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <CheckCircle size={32} />
                            </div>
                            <h3>Verified Buyers</h3>
                            <p>We connect you with pre-qualified, serious buyers ready to make offers.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <DollarSign size={32} />
                            </div>
                            <h3>Best Price</h3>
                            <p>Our market analysis ensures your property is priced competitively for maximum returns.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <FileText size={32} />
                            </div>
                            <h3>Full Support</h3>
                            <p>From listing to closing, we handle all paperwork and negotiations.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="sell-form-section">
                <div className="container">
                    <div className="form-grid">
                        <div className="form-content">
                            <h2>List Your Property</h2>
                            <p>Fill out the form below and one of our agents will contact you within 24 hours to discuss your property.</p>

                            <div className="agent-info">
                                <h4>Need immediate assistance?</h4>
                                <div className="contact-options">
                                    <a href="tel:+254706070747" className="contact-item">
                                        <Phone size={20} />
                                        <span>+254 706 070 747</span>
                                    </a>
                                    <a href="mailto:support@guri24.com" className="contact-item">
                                        <Mail size={20} />
                                        <span>support@guri24.com</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <form className="sell-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <User size={18} />
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <Mail size={18} />
                                        Email Address
                                    </label>
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
                                    <label>
                                        <Phone size={18} />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+254 7XX XXX XXX"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <Building size={18} />
                                        Property Type
                                    </label>
                                    <select
                                        value={formData.propertyType}
                                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                        required
                                    >
                                        <option value="">Select type</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="villa">Villa</option>
                                        <option value="land">Land</option>
                                        <option value="commercial">Commercial</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Property Location</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Westlands, Nairobi"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Expected Price (KSh)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 15,000,000"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group full">
                                <label>Property Description</label>
                                <textarea
                                    rows="4"
                                    placeholder="Describe your property (bedrooms, features, condition, etc.)"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                <Send size={18} />
                                Submit Property
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default SellPage;
