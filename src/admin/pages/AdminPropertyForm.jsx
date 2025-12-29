import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Upload, X, MapPin, Image as ImageIcon, Plus } from 'lucide-react';
import adminApi from '../../utils/adminApi';
import './AdminPropertyForm.css';

function AdminPropertyForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [error, setError] = useState('');
    const [imageUrls, setImageUrls] = useState(['']);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        type: 'apartment',
        purpose: 'rent',
        status: 'draft',
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        bedrooms: '',
        bathrooms: '',
        area_sqft: '',
        description: '',
        images: [],
        features: {
            parking: false,
            pool: false,
            gym: false,
            security: false,
            garden: false,
            balcony: false,
            furnished: false,
            airConditioning: false,
            heating: false,
            internet: false,
            elevator: false,
            petFriendly: false
        }
    });

    useEffect(() => {
        if (isEditing) {
            fetchProperty();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            setFetching(true);
            const data = await adminApi.getPropertyById(id);
            setFormData({
                title: data.title,
                price: data.price,
                type: data.type,
                purpose: data.purpose,
                status: data.status,
                location: data.location,
                address: data.address || '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                bedrooms: data.bedrooms || '',
                bathrooms: data.bathrooms || '',
                area_sqft: data.area_sqft || '',
                description: data.description || '',
                images: data.images || [],
                features: data.features || {
                    parking: false,
                    pool: false,
                    gym: false,
                    security: false,
                    garden: false,
                    balcony: false,
                    furnished: false,
                    airConditioning: false,
                    heating: false,
                    internet: false,
                    elevator: false,
                    petFriendly: false
                }
            });
            setImageUrls(data.images && data.images.length > 0 ? data.images : ['']);
        } catch (err) {
            console.error('Failed to fetch property:', err);
            setError('Failed to load property details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFeatureChange = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [feature]: !prev.features[feature]
            }
        }));
    };

    const handleImageUrlChange = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const addImageUrl = () => {
        setImageUrls([...imageUrls, '']);
    };

    const removeImageUrl = (index) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls.length > 0 ? newUrls : ['']);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Filter out empty image URLs
            const validImages = imageUrls.filter(url => url.trim() !== '');

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                area_sqft: parseInt(formData.area_sqft) || 0,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                address: formData.address || null,
                images: validImages,
                features: formData.features
            };

            if (isEditing) {
                await adminApi.updateProperty(id, payload);
            } else {
                await adminApi.createProperty(payload);
            }
            navigate('/admin/properties');
        } catch (err) {
            console.error('Failed to save property:', err);
            setError(err.response?.data?.detail || 'Failed to save property');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="admin-form-page">
            <div className="form-header">
                <button onClick={() => navigate('/admin/properties')} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <h1>{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
            </div>

            {error && <div className="error-message mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="property-form">
                <div className="form-grid">
                    {/* Basic Information */}
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-group">
                            <label>Property Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                minLength="10"
                                placeholder="e.g. Modern 3-Bedroom Apartment in Kilimani"
                            />
                            <span className="field-hint">Minimum 10 characters</span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Price *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="50000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Type *</label>
                                <select name="type" value={formData.type} onChange={handleChange}>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="land">Land</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Purpose *</label>
                                <select name="purpose" value={formData.purpose} onChange={handleChange}>
                                    <option value="rent">For Rent</option>
                                    <option value="sale">For Sale</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status *</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="form-section">
                        <h3><MapPin size={20} /> Location Details</h3>

                        <div className="form-group">
                            <label>Location (City, Area) *</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                minLength="3"
                                placeholder="Kilimani, Nairobi"
                            />
                        </div>

                        <div className="form-group">
                            <label>Detailed Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Ngong Road, Kilimani"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Latitude</label>
                                <input
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    step="0.00000001"
                                    placeholder="-1.28333000"
                                />
                                <span className="field-hint">GPS coordinate</span>
                            </div>
                            <div className="form-group">
                                <label>Longitude</label>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    step="0.00000001"
                                    placeholder="36.81666700"
                                />
                                <span className="field-hint">GPS coordinate</span>
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="form-section">
                        <h3>Property Details</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Bedrooms</label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Bathrooms</label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="2"
                                />
                            </div>
                            <div className="form-group">
                                <label>Area (sqft)</label>
                                <input
                                    type="number"
                                    name="area_sqft"
                                    value={formData.area_sqft}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="1500"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                required
                                minLength="50"
                                placeholder="Describe the property in detail... (minimum 50 characters)"
                            ></textarea>
                            <span className="field-hint">Minimum 50 characters</span>
                        </div>
                    </div>

                    {/* Features & Amenities */}
                    <div className="form-section">
                        <h3>Features & Amenities</h3>

                        <div className="features-grid">
                            {Object.entries({
                                parking: 'Parking',
                                pool: 'Swimming Pool',
                                gym: 'Gym/Fitness Center',
                                security: '24/7 Security',
                                garden: 'Garden',
                                balcony: 'Balcony',
                                furnished: 'Furnished',
                                airConditioning: 'Air Conditioning',
                                heating: 'Heating',
                                internet: 'Internet/WiFi',
                                elevator: 'Elevator',
                                petFriendly: 'Pet Friendly'
                            }).map(([key, label]) => (
                                <label key={key} className="feature-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.features[key]}
                                        onChange={() => handleFeatureChange(key)}
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="form-section">
                        <h3><ImageIcon size={20} /> Property Images</h3>

                        <div className="image-urls-container">
                            {imageUrls.map((url, index) => (
                                <div key={index} className="image-url-row">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="image-url-input"
                                    />
                                    {imageUrls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeImageUrl(index)}
                                            className="btn-remove-image"
                                            title="Remove"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addImageUrl}
                                className="btn-add-image"
                            >
                                <Plus size={18} />
                                Add Another Image URL
                            </button>
                        </div>

                        {imageUrls.some(url => url.trim()) && (
                            <div className="image-preview-grid">
                                {imageUrls.filter(url => url.trim()).map((url, index) => (
                                    <div key={index} className="image-preview">
                                        <img src={url} alt={`Preview ${index + 1}`} onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/properties')} className="btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Property
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminPropertyForm;
