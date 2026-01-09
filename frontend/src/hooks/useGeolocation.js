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
      }

      setLocation(coords);
      
      // If we don't need to wait for the address, we can resolve the promise here
      // while the address resolution continues in the background
      // (This comment remains for clarity on the logic flow)

      if (options.detailed) {
        // We start the address lookup but don't 'await' it if we want to return coords fast
        // However, some callers might still want the full result.
        // Let's make it so it updates the state when ready.
        getAddressFromCoords(coords.latitude, coords.longitude).then(addrDetails => {
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
            localStorage.setItem('last_known_location', JSON.stringify({ coords, addr: simplified }));
          }
        }).catch(err => {
          console.error('Reverse Geocoding Error:', err);
        });
      }

      return coords;
    } catch (err) {
      if (err.code === 3) {
        setError("Délai de localisation dépassé. Essayez de vous déplacer ou de vérifier votre connexion GPS.");
      } else {
        setError(err.message || 'Erreur de localisation');
      }
      console.error('Geolocation Error:', err);
      throw err; // Re-throw to let the caller handle it
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
