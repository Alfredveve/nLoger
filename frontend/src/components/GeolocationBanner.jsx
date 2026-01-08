import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GeolocationBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if banner was dismissed recently (e.g., last 24h)
    const dismissed = localStorage.getItem('geo-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }
    
    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('geo-banner-dismissed', Date.now().toString());
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setIsVisible(false);
          // Navigate to properties page with location params and map view
          navigate(`/properties?lat=${latitude}&lng=${longitude}&dist=10&view=map`);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Impossible de récupérer votre position. Veuillez vérifier vos paramètres GPS.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-linear-to-r from-primary-600 to-primary-800 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm animate-pulse">
            <MapPin className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Logements à proximité ?</h3>
            <p className="text-sm text-white/90 mb-3">
              Découvrez les logements disponibles autour de votre position actuelle en un clic.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleLocateMe}
                className="flex-1 bg-white text-primary-700 px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors shadow-sm"
              >
                Trouver maintenant
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm text-sm"
              >
                Plus tard
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeolocationBanner;
