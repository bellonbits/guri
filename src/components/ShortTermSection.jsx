import { Link } from 'react-router-dom';

import { Sparkles, Calendar, Wifi, Coffee } from 'lucide-react';
import './ShortTermSection.css';

function ShortTermSection() {
    return (
        <section className="short-term-section">
            <div className="container">
                <div className="short-term-content">
                    <div className="short-term-text">
                        <span className="badge-new">New Service</span>
                        <h2>Experience Luxury<br />Short-Term Stays</h2>
                        <p>
                            Discover our curated collection of premium apartments and homes
                            perfect for your next vacation, business trip, or weekend getaway.
                            Enjoy hotel-grade amenities with the comfort of a home.
                        </p>

                        <div className="features-list">
                            <div className="feature">
                                <Sparkles size={20} />
                                <span>Premium Cleaning</span>
                            </div>
                            <div className="feature">
                                <Calendar size={20} />
                                <span>Flexible Check-in</span>
                            </div>
                            <div className="feature">
                                <Wifi size={20} />
                                <span>High-Speed WiFi</span>
                            </div>
                            <div className="feature">
                                <Coffee size={20} />
                                <span>Welcome Kit</span>
                            </div>
                        </div>

                        <Link to="/rent" className="btn-explore">
                            Explore Stays
                        </Link>
                    </div>

                    <div className="short-term-visual">
                        {/* We use a CSS background or a composed grid of images here */}
                        <div className="visual-card card-1"></div>
                        <div className="visual-card card-2"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ShortTermSection;
