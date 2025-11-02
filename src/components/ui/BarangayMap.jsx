import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

const BarangayMap = ({ geoJsonData, affectedAreas = [], mapCenter = [14.3207, 120.7641], mapZoom = 13, height = "256px" }) => {
    
    const unselectedStyle = {
        fillColor: '#6b7280',
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.3
    };

    const selectedStyle = {
        fillColor: '#EF4444',
        weight: 2,
        opacity: 1,
        color: '#B91C1C',
        fillOpacity: 0.7
    };

    const styleGeoJson = (feature) => {
        const barangayName = feature?.properties?.NAME_3;
        if (affectedAreas.includes(barangayName)) {
            return selectedStyle;
        }
        return unselectedStyle;
    };

    const onEachFeature = (feature, layer) => {
        const barangayName = feature?.properties?.NAME_3;
        if (barangayName) {
            const isAffected = affectedAreas.includes(barangayName);
            const popupContent = `
                <div>
                    <strong>${barangayName}</strong>
                    <p style="color: ${isAffected ? '#B91C1C' : '#374151'}; margin: 0; font-weight: bold;">
                        ${isAffected ? 'AFFECTED' : 'Not Affected'}
                    </p>
                </div>
            `;
            layer.bindPopup(popupContent);
        }
    };
    
    const mapKey = JSON.stringify(affectedAreas);

    return (
        <MapContainer 
            key={mapKey} 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={false} 
            style={{ height: height, width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
                data={geoJsonData}
                style={styleGeoJson}
                onEachFeature={onEachFeature}
            />
        </MapContainer>
    );
};

export default BarangayMap;