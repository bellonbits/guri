import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight, Home, Umbrella, Tent, Flame, Sparkles, Castle, Tractor, Palmtree, Club } from 'lucide-react';
import analytics from '../utils/analytics';
import PropertyCard from '../components/PropertyCard';
import ShortTermSection from '../components/ShortTermSection';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import './HomePage.css';

function HomePage() {
    const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'rent'
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Mansions');
    const [locationInput, setLocationInput] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch properties from API
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const response = await propertyApi.getProperties({ page: 1, page_size: 4 });
                const transformed = response.properties.map(transformProperty);
                setFeaturedProperties(transformed);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
                setFeaturedProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>

                <div className="hero-content">
                    <h1>Find your next place to live</h1>

                    {/* Floating Tabs - Now separated for better mobile layout control */}
                    <div className="search-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('buy')}
                        >
                            Buy
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'rent' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rent')}
                        >
                            Rent
                        </button>
                    </div>

                    <div className="search-container">
                        {/* Connected Search Bar */}
                        <div className="search-bar">
                            <div className="search-input-group location-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    placeholder="Where are you going?"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                />
                            </div>

                            <div className="divider"></div>

                            <div className="search-input-group type-group">
                                <label>Type</label>
                                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                                    <option value="">Add type</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                </select>
                            </div>

                            <div className="divider"></div>

                            <div className="search-input-group price-group">
                                <label>Price Range</label>
                                <input
                                    type="text"
                                    placeholder="Add budget"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                />
                            </div>

                            <div className="search-button-wrapper">
                                <Link
                                    to="/listings"
                                    className="search-circle-btn"
                                    onClick={() => {
                                        analytics.trackSearch({
                                            type: activeTab,
                                            location: locationInput,
                                            propertyType: propertyType,
                                            priceRange: priceRange
                                        });
                                    }}
                                >
                                    <Search size={22} strokeWidth={2.5} />
                                    {/* Span only visible on mobile via css */}
                                    <span>Search</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Properties Section */}
            <section className="section-featured">
                <div className="container">
                    <div className="section-header">
                        <h2>Featured Properties</h2>
                        <Link to="/listings" className="view-all-link">
                            View all <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="properties-grid">
                        {featuredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Short Term Stays Section (New) */}
            <ShortTermSection />

            {/* Categories */}
            <section className="section-categories">
                <div className="container">
                    <h2>Explore by Category</h2>
                    <div className="categories-scroll">
                        {[
                            { name: 'Beachfront', icon: <Umbrella size={24} /> },
                            { name: 'Cabins', icon: <Tent size={24} /> },
                            { name: 'Trending', icon: <Flame size={24} /> },
                            { name: 'New', icon: <Sparkles size={24} /> },
                            { name: 'Mansions', icon: <Castle size={24} /> },
                            { name: 'Farms', icon: <Tractor size={24} /> },
                            { name: 'Islands', icon: <Palmtree size={24} /> },
                            { name: 'Golfing', icon: <Club size={24} /> }
                        ].map((cat, i) => (
                            <button
                                key={i}
                                className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveCategory(cat.name);
                                    analytics.trackCategorySelect(cat.name);
                                }}
                            >
                                {cat.icon}
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
