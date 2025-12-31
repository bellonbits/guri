import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, MoreVertical, Eye } from 'lucide-react';
import { propertyApi } from '../../utils/propertyApi';
import './AgentListings.css';

const AgentListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await propertyApi.getAgentProperties();
            setListings(data.properties || []);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            // Fallback for demo
            setListings([
                { id: 1, title: 'Sunny Apartment', type: 'apartment', price: 15000, status: 'published', views: 120, created_at: '2023-10-10' },
                { id: 2, title: 'Cozy Cottage', type: 'house', price: 45000, status: 'draft', views: 0, created_at: '2023-11-05' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            console.log('Deleting', id);
            setListings(listings.filter(l => l.id !== id));
        }
    };

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="agent-listings-page">
            <div className="listings-header">
                <div>
                    <h1 className="page-title">My Listings</h1>
                    <p className="page-subtitle">Manage your property portfolio.</p>
                </div>
                <Link to="/agent/listings/new" className="btn-primary-agent">
                    <Plus size={20} />
                    <span>Add New Property</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="listings-toolbar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="listings-table-container">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <table className="listings-table">
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Stats</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredListings.length > 0 ? (
                                filteredListings.map((listing) => (
                                    <tr key={listing.id}>
                                        <td className="col-title">
                                            <div className="listing-title-cell">
                                                <div className="listing-thumb-placeholder">
                                                    {listing.type.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="listing-info">
                                                    <div className="listing-name">{listing.title}</div>
                                                    <div className="listing-id">ID: {listing.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="capitalize">{listing.type}</span></td>
                                        <td>KES {listing.price.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge status-${listing.status}`}>
                                                {listing.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="stat-cell">
                                                <Eye size={16} /> {listing.views}
                                            </div>
                                        </td>
                                        <td>{new Date(listing.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="action-btn" title="Edit">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="action-btn delete" title="Delete" onClick={() => handleDelete(listing.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-table">
                                        No properties found. <Link to="/agent/listings/new">Add your first one!</Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AgentListings;
