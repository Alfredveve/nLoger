import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Custom Marker Icons (SVG Pins for perfect transparency)
const getMarkerIcon = (type) => {
  const colors = {
    'APPARTEMENT': '#22c55e', // Green-500
    'SALON_CHAMBRE': '#3b82f6', // Blue-500
    'CHAMBRE_SIMPLE': '#ef4444', // Red-500
    'VILLA': '#a855f7', // Purple-500
    'STUDIO': '#06b6d4', // Cyan-500
    'MAGASIN': '#f97316', // Orange-500
    'BUREAU': '#64748b', // Slate-500
    'DEFAULT': '#94a3b8' // Slate-400
  };

  const icons = {
    'APPARTEMENT': `<path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17" />`,
    'SALON_CHAMBRE': `<path d="M2 20h20M7 8V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3M9 20v-4c0-.5.5-1 1-1h4c.5 0 1 .5 1 1v4" /><rect width="20" height="8" x="2" y="8" rx="2" />`,
    'CHAMBRE_SIMPLE': `<path d="M2 4v16M2 8h18M15 8v8M2 12h18M2 16h18" />`,
    'VILLA': `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />`,
    'STUDIO': `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><circle cx="12" cy="13" r="2" />`,
    'MAGASIN': `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />`,
    'BUREAU': `<rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />`,
    'DEFAULT': `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />`
  };

  const color = colors[type] || colors['DEFAULT'];
  const iconMarkup = icons[type] || icons['DEFAULT'];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="flex items-center justify-center w-10 h-10 transform -translate-y-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 drop-shadow-lg">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="${color}" stroke="white" stroke-width="1.5" />
          <g transform="translate(6, 4) scale(0.5)">
            ${iconMarkup}
          </g>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
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
    // Forcer le rafraîchissement de la taille pour mobile
    map.invalidateSize();

    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { 
        padding: [20, 20], 
        maxZoom: 16, 
        duration: 0.5 
      });
    } else if (center && zoom) {
      map.setView(center, zoom, { 
        animate: true,
        duration: 0.5 
      });
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
    <div className="h-[350px] sm:h-[500px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        className="h-full w-full"
        scrollWheelZoom={true}
        tap={true}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} bounds={mapBounds} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div class="flex items-center justify-center w-10 h-10">
                  <div class="absolute w-10 h-10 bg-primary-500/20 rounded-full animate-ping"></div>
                  <div class="relative w-6 h-6 bg-primary-600 border-2 border-white rounded-full shadow-lg">
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -20],
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
                <Popup 
                  maxWidth={280}
                  autoPan={true}
                  autoPanPadding={[50, 50]}
                >
                  <div className="p-1 min-w-[200px]">
                    <Link 
                      to={`/property/${property.id}`}
                      className="font-bold text-primary-600 hover:text-primary-800 transition-colors block mb-1 text-base"
                    >
                      {property.title}
                    </Link>
                    <p className="font-black text-gray-900 text-lg">{parseInt(property.price).toLocaleString()} GNF</p>
                    <div className="text-sm text-gray-500 mt-2 space-y-1">
                      <p className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.quartier_name}, {property.secteur_name}
                      </p>
                      {property.distance !== undefined && (
                        <p className="text-primary-600 font-bold flex items-center bg-primary-50 px-2 py-0.5 rounded-lg w-fit">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          À {property.distance} km
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center text-xs text-gray-600 font-medium">
                      <span className="mr-1.5 opacity-70">👤</span>
                      {property.agent_name ? (
                        <span>Géré par : <span className="font-bold text-gray-900">{property.agent_name}</span></span>
                      ) : (
                        <span>Propriétaire : <span className="font-bold text-gray-900">{property.owner_name}</span></span>
                      )}
                    </div>

                    <Link 
                      to={`/property/${property.id}`}
                      className="mt-3 block w-full bg-slate-800 !text-white text-center py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-slate-900 transition-colors uppercase tracking-wider"
                    >
                      VOIR DÉTAILS
                    </Link>
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
