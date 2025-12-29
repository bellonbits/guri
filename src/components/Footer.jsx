import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-wave">
                <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 50L60 45.8C120 41.7 240 33.3 360 37.5C480 41.7 600 58.3 720 62.5C840 66.7 960 58.3 1080 50C1200 41.7 1320 33.3 1380 29.2L1440 25V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="#0d3b66" />
                </svg>
            </div>

            <div className="footer-content">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <img src="/logo.png" alt="Guri24" className="footer-logo" />
                            <p>Guri 24 is East Africa's trusted real estate platform for buying, selling, and renting properties.</p>
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

                        <div className="footer-links">
                            <h4>Our Services</h4>
                            <ul>
                                <li><Link to="/buy">Buy Property</Link></li>
                                <li><Link to="/sell">Sell Property</Link></li>
                                <li><Link to="/rent">Rent Property</Link></li>
                                <li><Link to="/listings">All Listings</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                            </ul>
                        </div>

                        <div className="footer-contact">
                            <h4>Nairobi Office</h4>
                            <ul>
                                <li>
                                    <MapPin size={18} />
                                    <span>Westpark Towers Suite 503<br />Off Muthithi Road</span>
                                </li>
                                <li>
                                    <Mail size={18} />
                                    <span>support@guri24.com</span>
                                </li>
                                <li>
                                    <Phone size={18} />
                                    <span>+254 706 070 747</span>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-newsletter">
                            <h4>Stay Updated</h4>
                            <p>Subscribe to get the latest property listings and market updates.</p>
                            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                                <input type="email" placeholder="Enter your email" />
                                <button type="submit" className="btn btn-primary">Subscribe</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Guri24. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
