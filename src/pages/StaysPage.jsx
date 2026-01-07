import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import './StaysPage.css';

function StaysPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

    useEffect(() => {
        const fetchStays = async () => {
            try {
                setLoading(true);
                const response = await propertyApi.getProperties({
                    purpose: 'stay',
                    page_size: 100
                });

                // Robust extraction of the array
                let propertiesList = [];
                if (Array.isArray(response)) {
                    propertiesList = response;
                } else if (response?.items?.properties && Array.isArray(response.items.properties)) {
                    propertiesList = response.items.properties;
                } else if (response && Array.isArray(response.items)) {
                    propertiesList = response.items;
                } else if (response && Array.isArray(response.properties)) {
                    propertiesList = response.properties;
                }

                const transformed = propertiesList.map(transformProperty);
                setProperties(transformed);
            } catch (error) {
                console.error('Failed to fetch stays:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStays();
    }, []);

    const handleSearch = () => {
        // Logic for advanced search can go here if backend supports it
        // For now, it filters the current local properties list
        console.log('Searching for:', { searchQuery, checkIn, checkOut, guests });
    };

    const filteredStays = properties.filter(stay =>
        stay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stay.location.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stay.location.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="stays-page">
            <header className="stays-header">
                <div className="container">
                    <div className="stays-search-bar">
                        <div className="search-section location-input">
                            <label>Location</label>
                            <input
                                type="text"
                                placeholder="Search areas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="search-divider"></div>
                        <div className="search-section date-section">
                            <label>Check in</label>
                            <input
                                type="date"
                                className="date-input"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                        <div className="search-divider"></div>
                        <div className="search-section date-section">
                            <label>Check out</label>
                            <input
                                type="date"
                                className="date-input"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                        </div>
                        <div className="search-divider"></div>
                        <div className="search-section guests-input" onClick={() => setShowGuestPicker(!showGuestPicker)}>
                            <label>Guests</label>
                            <div className="guest-selector">
                                {guests} guest{guests > 1 ? 's' : ''}
                            </div>
                            {showGuestPicker && (
                                <div className="guest-dropdown" onClick={(e) => e.stopPropagation()}>
                                    <div className="guest-row">
                                        <span>Adults</span>
                                        <div className="counter">
                                            <button onClick={() => setGuests(Math.max(1, guests - 1))}>-</button>
                                            <span>{guests}</span>
                                            <button onClick={() => setGuests(guests + 1)}>+</button>
                                        </div>
                                    </div>
                                    <button className="done-btn" onClick={() => setShowGuestPicker(false)}>Apply</button>
                                </div>
                            )}
                        </div>
                        <button className="search-btn" onClick={handleSearch}>
                            <Search size={20} color="white" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container stays-main">
                <div className="stays-category-bar">
                    <div className="category-item active">
                        <MapPin size={22} />
                        <span>All Stays</span>
                    </div>
                </div>

                {loading ? (
                    <div className="stays-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card"></div>)}
                    </div>
                ) : (
                    <>
                        {filteredStays.length > 0 ? (
                            <div className="stays-grid">
                                {filteredStays.map((stay) => (
                                    <PropertyCard key={stay.id} property={stay} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-stays">
                                <h2>No stays available</h2>
                                <p>We couldn't find any stays matching your criteria. Try adjusting your search.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default StaysPage;
