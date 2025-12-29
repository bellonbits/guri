import { Home, Users, MapPin, Award, Target, Eye, CheckCircle } from 'lucide-react';
import './AboutPage.css';

function AboutPage() {
    return (
        <div className="about-page">
            {/* Hero */}
            <section className="about-hero">
                <div className="about-hero-overlay"></div>
                <div className="about-hero-content">
                    <h1>About Us</h1>
                    <p>Trusted real estate platform across East Africa</p>
                </div>
            </section>

            {/* About Content */}
            <section className="about-content">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800" alt="About Guri24" />
                            <div className="experience-badge">
                                <span className="years">10+</span>
                                <span className="text">Years Experience</span>
                            </div>
                        </div>
                        <div className="about-text">
                            <h2>About Guri24</h2>
                            <p className="lead">Guri24 is a trusted real estate platform that connects property seekers with verified listings across Kenya and East Africa.</p>
                            <p>We believe finding your dream home or ideal investment should be simple, transparent, and reliable. Whether you're searching for an apartment in Nairobi, a family house in Mombasa, or land in the outskirts, Guri24 helps you discover the right property — all in one place.</p>

                            <div className="about-features">
                                <div className="feature-item">
                                    <CheckCircle size={24} />
                                    <span>Verified Listings Only</span>
                                </div>
                                <div className="feature-item">
                                    <CheckCircle size={24} />
                                    <span>Professional Agents</span>
                                </div>
                                <div className="feature-item">
                                    <CheckCircle size={24} />
                                    <span>Transparent Pricing</span>
                                </div>
                                <div className="feature-item">
                                    <CheckCircle size={24} />
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="about-stats">
                <div className="container">
                    <div className="stats-row">
                        <div className="stat-box">
                            <Home size={32} />
                            <span className="number">500+</span>
                            <span className="label">Properties</span>
                        </div>
                        <div className="stat-box">
                            <Users size={32} />
                            <span className="number">15K+</span>
                            <span className="label">Clients</span>
                        </div>
                        <div className="stat-box">
                            <MapPin size={32} />
                            <span className="number">50+</span>
                            <span className="label">Cities</span>
                        </div>
                        <div className="stat-box">
                            <Award size={32} />
                            <span className="number">81+</span>
                            <span className="label">Awards</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="mission-section">
                <div className="container">
                    <div className="mission-grid">
                        <div className="mission-card">
                            <div className="mission-icon">
                                <Target size={40} />
                            </div>
                            <h3>Our Mission</h3>
                            <p>To provide the most trusted and accessible real estate platform in East Africa, connecting property seekers with verified opportunities while ensuring transparency and exceptional service.</p>
                        </div>
                        <div className="mission-card">
                            <div className="mission-icon">
                                <Eye size={40} />
                            </div>
                            <h3>Our Vision</h3>
                            <p>To become the leading real estate marketplace across Africa, empowering millions to find their perfect home and investment opportunities with ease and confidence.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-section">
                <div className="container">
                    <div className="section-title">
                        <h2>We Do Better</h2>
                        <p>At Guri24, we understand what matters most to property seekers and owners — trust, transparency, and results.</p>
                    </div>
                    <div className="why-grid">
                        <div className="why-card">
                            <div className="why-number">01</div>
                            <h4>Verified Listings</h4>
                            <p>Every property on our platform is verified by our team to ensure authenticity and accuracy.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-number">02</div>
                            <h4>Expert Agents</h4>
                            <p>Our experienced agents provide personalized guidance throughout your property journey.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-number">03</div>
                            <h4>Wide Coverage</h4>
                            <p>From Somalia to Djibouti, we cover the entire East African real estate market.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-number">04</div>
                            <h4>Fast Response</h4>
                            <p>Our 24/7 support ensures you get quick answers and assistance whenever you need it.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutPage;
