import { useState, useEffect } from 'react';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import './ListingsPage.css';

function ListingsPage({ purpose = 'all', title = 'All Listings', subtitle = 'Browse all available properties' }) {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyType, setPropertyType] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch properties from API
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const params = {
                    page: 1,
                    page_size: 100 // Get all for now
                };

                // Add purpose filter if not 'all'
                if (purpose && purpose !== 'all') {
                    params.purpose = purpose.toLowerCase();
                }

                // Add type filter if not 'all'
                if (propertyType && propertyType !== 'all') {
                    params.type = propertyType.toLowerCase();
                }

                // Add search query
                if (searchQuery) {
                    params.search = searchQuery;
                }

                const response = await propertyApi.getProperties(params);
                const transformed = response.properties.map(transformProperty);
                setProperties(transformed);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [purpose, propertyType, searchQuery]);

    // Client-side filtering and sorting
    const filteredProperties = properties
        .filter(property => {
            const matchesType = propertyType === 'all' || property.type.toLowerCase() === propertyType.toLowerCase();
            return matchesType;
        })
        .sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            return new Date(b.created_at) - new Date(a.created_at); // newest
        });

    return (
        <div className="listings-page">
            {/* Hero */}
            <section className="listings-hero">
                <div className="listings-hero-overlay"></div>
                <div className="listings-hero-content">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            </section>

            {/* Filters */}
            <section className="listings-filters">
                <div className="container">
                    <div className="filters-header">
                        <button
                            className={`mobile-filter-toggle ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal size={20} />
                            <span>{showFilters ? 'Hide Filters' : 'Filter & Search'}</span>
                        </button>
                    </div>

                    <div className={`filters-bar ${showFilters ? 'show' : ''}`}>
                        <div className="search-input">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search by location or title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <select
                                value={propertyType}
                                onChange={(e) => setPropertyType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                                <option value="office">Office</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>

                        <div className="view-toggle">
                            <button
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="results-info">
                        <span>{filteredProperties.length} properties found</span>
                    </div>
                </div>
            </section>

            {/* Properties Grid */}
            <section className="listings-content">
                <div className="container">
                    <div className={`properties-grid ${viewMode}`}>
                        {filteredProperties.length > 0 ? (
                            filteredProperties.map((property, index) => (
                                <div
                                    key={property.id}
                                    className="animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <PropertyCard property={property} />
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <SlidersHorizontal
                                    size={48}
                                    onClick={() => {
                                        setShowFilters(true);
                                        window.scrollTo({ top: 100, behavior: 'smooth' });
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                                <h3>No properties found</h3>
                                <p>Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ListingsPage;
