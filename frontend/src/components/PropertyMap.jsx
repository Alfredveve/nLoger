import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Custom Marker Icons
const createIcon = (url) => new L.Icon({
  iconUrl: url,
  iconSize: [40, 40], // Adjusted size for miniatures
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const apartmentIcon = createIcon('/markers/marker_apartment.png');
const salonIcon = createIcon('/markers/marker_salon.png');
const chamberIcon = createIcon('/markers/marker_chamber.png');
const defaultIcon = createIcon('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png');

const getMarkerIcon = (type) => {
  switch (type) {
    case 'APPARTEMENT':
      return apartmentIcon;
    case 'SALON_CHAMBRE':
      return salonIcon;
    case 'CHAMBRE_SIMPLE':
      return chamberIcon;
    default:
      return defaultIcon;
  }
};

const REGION_COORDINATES = {
  'Conakry': { center: [9.6412, -13.5784], zoom: 12 },
  'Kindia': { center: [10.0569, -12.8658], zoom: 9 },
  'Boké': { center: [10.9409, -14.2967], zoom: 9 },
  'Mamou': { center: [10.3755, -12.0915], zoom: 9 },
  'Labé': { center: [11.3182, -12.2833], zoom: 9 },
  'Faranah': { center: [10.0404, -10.7434], zoom: 8 },
  'Kankan': { center: [10.3833, -9.3000], zoom: 8 },
  'Nzérékoré': { center: [7.7562, -8.8139], zoom: 8 },
};

const MapUpdater = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17, duration: 2 });
    } else if (center && zoom) {

      map.flyTo(center, zoom, { duration: 2 });
    }
  }, [center, zoom, bounds, map]);
  return null;
};


const PropertyMap = ({ properties, selectedRegion, userLocation }) => {

  // Centre de la Guinée (Conakry) par défaut
  const defaultCenter = [9.6412, -13.5784];
  const defaultZoom = 7;

  let mapCenter = defaultCenter;
  let mapZoom = defaultZoom;
  let mapBounds = null;

  if (selectedRegion && REGION_COORDINATES[selectedRegion.name]) {
    mapCenter = REGION_COORDINATES[selectedRegion.name].center;
    mapZoom = REGION_COORDINATES[selectedRegion.name].zoom;
  } else if (userLocation) {
    mapCenter = [userLocation.latitude, userLocation.longitude];
    mapZoom = 13; // Good zoom level to see a neighborhood
    
    // Calculate bounds to include user and properties
    const locs = properties
      .filter(p => p.latitude && p.longitude)
      .map(p => [p.latitude, p.longitude]);
    
    if (locs.length > 0) {
      mapBounds = [[userLocation.latitude, userLocation.longitude], ...locs];
    }
  }



  return (
    <div className="h-[500px] rounded-lg overflow-hidden border border-gray-100">
      <MapContainer center={defaultCenter} zoom={defaultZoom} className="h-full w-full">
        <MapUpdater center={mapCenter} zoom={mapZoom} bounds={mapBounds} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            })}
          >
            <Popup>Votre position</Popup>
          </Marker>
        )}
        {properties.map((property) => {

          if (property.latitude && property.longitude) {
            return (
              <Marker 
                key={property.id} 
                position={[property.latitude, property.longitude]}
                icon={getMarkerIcon(property.property_type)}
              >
                <Popup>
                  <div className="p-2">
                    <Link 
                      to={`/property/${property.id}`}
                      className="font-bold text-primary-600 hover:text-primary-800 transition-colors block mb-1"
                    >
                      {property.title}
                    </Link>
                    <p className="font-semibold text-gray-800">{parseInt(property.price).toLocaleString()} GNF</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>{property.quartier_name}, {property.secteur_name}</p>
                      {property.distance !== undefined && (
                        <p className="text-primary-600 font-bold mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          À {property.distance} km
                        </p>
                      )}
                    </div>
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
