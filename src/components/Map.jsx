import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

// Fix for default marker icon not showing
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function Map({ lat, lng, zoom = 13, popupText, height = "400px", className = "" }) {
    const position = [lat, lng];

    return (
        <div className={`map-wrapper ${className}`} style={{ height }}>
            <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        {popupText}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default Map;
