import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyMap = ({ properties }) => {
  // Centre de la Guinée (Conakry)
  const center = [9.6412, -13.5784];

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border border-gray-100">
      <MapContainer center={center} zoom={7} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => {
          if (property.latitude && property.longitude) {
            return (
              <Marker 
                key={property.id} 
                position={[property.latitude, property.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{property.title}</h3>
                    <p className="text-sm text-gray-600">{property.price} GNF</p>
                    <p className="text-xs text-gray-500">{property.secteur_name}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
