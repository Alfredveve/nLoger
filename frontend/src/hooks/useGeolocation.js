import { useState, useCallback, useEffect } from 'react';
import { getCurrentPosition, getAddressFromCoords } from '../services/GeolocationService';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshLocation = useCallback(async (options = { detailed: true }) => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentPosition();
      
      // Accuracy check: if > 500m, it's likely IP-based or low-quality
      if (coords.accuracy > 500) {
        console.warn("Location accuracy is poor:", coords.accuracy);
        // We still proceed but maybe we'll add a flag or note
      }

      setLocation(coords);
      
      if (options.detailed) {
        const addrDetails = await getAddressFromCoords(coords.latitude, coords.longitude);
        if (addrDetails) {
          const simplified = {
            region: addrDetails.state || addrDetails.region || '',
            prefecture: addrDetails.county || '',
            city: addrDetails.city || addrDetails.town || addrDetails.village || '',
            suburb: addrDetails.suburb || addrDetails.neighbourhood || addrDetails.road || '',
            road: addrDetails.road || '',
            accuracy: coords.accuracy,
            full: [
              addrDetails.suburb || addrDetails.neighbourhood || addrDetails.road,
              addrDetails.city || addrDetails.town || addrDetails.village,
              addrDetails.county,
              addrDetails.state
            ].filter(Boolean).join(', ')
          };
          setAddress(simplified);
          // Persist simplified location for session
          localStorage.setItem('last_known_location', JSON.stringify({ coords, addr: simplified }));
        }
      }
      return coords;
    } catch (err) {
      if (err.code === 3) {
        setError("Délai de localisation dépassé. Essayez de vous déplacer ou de vérifier votre connexion GPS.");
      } else {
        setError(err.message || 'Erreur de localisation');
      }
      console.error('Geolocation Error:', err);
    } finally {
      setLoading(false);
    }

  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setAddress(null);
    localStorage.removeItem('last_known_location');
  }, []);

  // Load from storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('last_known_location');
    if (saved) {
      try {
        const { coords, addr } = JSON.parse(saved);
        setLocation(coords);
        setAddress(addr);
      } catch {
        localStorage.removeItem('last_known_location');
      }
    }
  }, []);

  return { location, address, loading, error, refreshLocation, clearLocation };

};

export default useGeolocation;
