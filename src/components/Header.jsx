import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, Phone, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

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
        setMobileMenuOpen(false);
    }, [location]);

    return (
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
                    className="mobile-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav">
                    <Link to="/" className="mobile-link">Home</Link>
                    <Link to="/about" className="mobile-link">About</Link>
                    <Link to="/buy" className="mobile-link">Buy</Link>
                    <Link to="/sell" className="mobile-link">Sell</Link>
                    <Link to="/rent" className="mobile-link">Rent</Link>
                    <Link to="/listings" className="mobile-link">Listings</Link>
                    <Link to="/contact" className="mobile-link">Contact</Link>

                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <Link to="/admin" className="mobile-link">Admin</Link>
                    )}

                    <div className="mobile-divider"></div>

                    {isAuthenticated ? (
                        <Link to="/profile" className="mobile-link user-link">
                            <User size={20} />
                            {user?.name || 'My Profile'}
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-link">Sign In</Link>
                            <Link to="/register" className="mobile-link primary">Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
