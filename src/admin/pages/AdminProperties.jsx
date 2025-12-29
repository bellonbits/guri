import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Check, X, Filter, Loader } from 'lucide-react';
import DataTable from '../components/DataTable';
import adminApi from '../../utils/adminApi';
import './AdminProperties.css';

import { useNavigate } from 'react-router-dom';
// ...

function AdminProperties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    // ...

    // ... inside columns
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, total: 0, pageSize: 20 });

    useEffect(() => {
        fetchProperties();
    }, [selectedFilter, selectedType, pagination.page]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                page_size: pagination.pageSize
            };

            if (selectedFilter !== 'all') {
                params.status = selectedFilter; // API expects lowercase enum
            }
            if (selectedType !== 'all') {
                params.type = selectedType;
            }

            const response = await adminApi.getProperties(params);
            setProperties(response.properties);
            setPagination(prev => ({ ...prev, total: response.total }));
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;
        try {
            await adminApi.deleteProperty(id);
            fetchProperties(); // Refresh list
        } catch (error) {
            console.error("Failed to delete property:", error);
            alert("Failed to delete property");
        }
    };

    // Table columns configuration
    const columns = [
        {
            key: 'title',
            label: 'Property',
            width: '25%',
            render: (value, row) => (
                <div className="property-cell">
                    <span className="property-title">{value}</span>
                    <span className="property-location">{row.location}</span>
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            width: '10%',
            render: (value) => (
                <span className="type-badge">{value}</span>
            )
        },
        {
            key: 'purpose',
            label: 'Purpose',
            width: '10%',
            render: (value) => (
                <span className={`purpose-badge ${value.toLowerCase()}`}>{value}</span>
            )
        },
        {
            key: 'price',
            label: 'Price',
            width: '12%',
            render: (value, row) => (
                <span className="price-cell">
                    ${value.toLocaleString()}
                    {row.purpose === 'Rent' && <span className="price-unit">/mo</span>}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            width: '10%',
            render: (value) => (
                <span className={`status-badge status-${value.toLowerCase()}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'views',
            label: 'Views',
            width: '8%',
            render: (value) => value.toLocaleString()
        },
        {
            key: 'agent',
            label: 'Agent',
            width: '12%'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '13%',
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn view" title="View" onClick={(e) => { e.stopPropagation(); navigate(`/property/${row.slug}`); }}>
                        <Eye size={16} />
                    </button>
                    <button className="action-btn edit" title="Edit" onClick={(e) => { e.stopPropagation(); navigate(`/admin/properties/edit/${row.id}`); }}>
                        <Edit size={16} />
                    </button>
                    <button className="action-btn delete" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const handleRowClick = (property) => {
        console.log('Property clicked:', property);
        // Navigate to property detail or open modal
    };

    return (
        <div className="admin-properties">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Properties</h1>
                    <p>Manage all property listings</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/properties/create')}
                >
                    <Plus size={20} />
                    Add Property
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
                    <span>Status:</span>
                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className="filter-group">
                    <span>Type:</span>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>

                <div className="filter-stats">
                    <span>{pagination.total} properties</span>
                </div>
            </div>

            {/* Properties Table */}
            {loading ? (
                <div className="loading-state">
                    <Loader className="animate-spin" size={32} />
                    <p>Loading properties...</p>
                </div>
            ) : (
                <DataTable
                    data={properties}
                    columns={columns}
                    searchable
                    sortable
                    onRowClick={handleRowClick}
                    emptyMessage="No properties found"
                />
            )}        </div>
    );
}

export default AdminProperties;
