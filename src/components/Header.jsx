import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, Phone, X, Home, Info, ShoppingBag, Tag, Building2, Hotel, List, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

import { createPortal } from 'react-dom';

function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    // Check if we are on the homepage
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''} ${isHomePage ? 'is-home' : ''}`}>
                <div className="header-container">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <img src="/logo.png" alt="Guri24" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <ul className="nav-list">
                            <li><Link to="/" className="nav-link">Home</Link></li>
                            <li><Link to="/about" className="nav-link">About</Link></li>
                            <li><Link to="/buy" className="nav-link">Buy</Link></li>
                            <li><Link to="/rent" className="nav-link">Rent</Link></li>
                            <li><Link to="/stays" className="nav-link">StayHub</Link></li>
                            <li><Link to="/listings" className="nav-link">Listings</Link></li>
                            {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <li><Link to="/admin" className="nav-link">Admin</Link></li>
                            )}
                        </ul>
                    </nav>

                    {/* Right Actions */}
                    <div className="header-actions">
                        <a href="tel:+254706070747" className="phone-link">
                            <Phone size={18} />
                            <span>+254 706 070 747</span>
                        </a>

                        {isAuthenticated ? (
                            <Link to="/profile" className="btn-visit user-btn">
                                <User size={18} />
                                <span>{user?.name || 'Profile'}</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="btn-visit">
                                <User size={18} />
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle (only visible on small screens) */}
                    <button
                        className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay - Portal to Body */}
            {createPortal(
                <>
                    {mobileMenuOpen && (
                        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
                    )}
                    <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                        <div className="mobile-menu-header">
                            <span className="mobile-menu-title">Menu</span>
                            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="mobile-nav">
                            <Link to="/" className="mobile-link">
                                <Home size={20} />
                                <span>Home</span>
                            </Link>
                            <Link to="/about" className="mobile-link">
                                <Info size={20} />
                                <span>About</span>
                            </Link>
                            <Link to="/buy" className="mobile-link">
                                <ShoppingBag size={20} />
                                <span>Buy</span>
                            </Link>
                            <Link to="/sell" className="mobile-link">
                                <Tag size={20} />
                                <span>Sell</span>
                            </Link>
                            <Link to="/rent" className="mobile-link">
                                <Building2 size={20} />
                                <span>Rent</span>
                            </Link>
                            <Link to="/stays" className="mobile-link">
                                <Hotel size={20} />
                                <span>Stays</span>
                            </Link>
                            <Link to="/listings" className="mobile-link">
                                <List size={20} />
                                <span>Listings</span>
                            </Link>

                            {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <Link to="/admin" className="mobile-link admin-link">
                                    <Shield size={20} />
                                    <span>Admin</span>
                                </Link>
                            )}

                            <div className="mobile-divider"></div>

                            {isAuthenticated ? (
                                <Link to="/profile" className="mobile-link user-link">
                                    <User size={20} />
                                    <span>{user?.name || 'My Profile'}</span>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-link">
                                        <User size={20} />
                                        <span>Sign In</span>
                                    </Link>
                                    <Link to="/register" className="mobile-link primary">
                                        <User size={20} />
                                        <span>Sign Up</span>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </>,
                document.body
            )}
        </>
    );
}

export default Header;
