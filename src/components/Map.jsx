import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Map.css';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const Map = ({ center, zoom = 15 }) => {
    // Use a fallback center if none provided (Nairobi)
    const mapCenter = center || { lat: -1.2921, lng: 36.8219 };

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={zoom}
            >
                <Marker position={mapCenter} />
            </GoogleMap>
        </LoadScript>
    );
};

export default React.memo(Map);
