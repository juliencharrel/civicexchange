"use client";
import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getLocationByIP, DEFAULT_LOCATION } from '@/lib/geolocation';
import MapComponent from './MapComponent';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface MapWithGeolocationProps {
  searchParams: {
    lat?: string;
    lng?: string;
    zoom?: string;
    name?: string;
  };
  initialInitiatives: any[];
}

export default function MapWithGeolocation({ searchParams, initialInitiatives }: MapWithGeolocationProps) {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    name: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { latitude: geoLat, longitude: geoLng, loading: geoLoading, error: geoError } = useGeolocation();

  useEffect(() => {
    async function determineLocation() {
      // Si on a des paramètres dans l'URL, les utiliser en priorité
      if (searchParams.lat && searchParams.lng) {
        setLocation({
          lat: parseFloat(searchParams.lat),
          lng: parseFloat(searchParams.lng),
          zoom: searchParams.zoom ? parseInt(searchParams.zoom) : 12,
          name: searchParams.name ? decodeURIComponent(searchParams.name) : ''
        });
        setLoading(false);
        return;
      }

      // Sinon, essayer la géolocalisation du navigateur
      if (geoLat && geoLng) {
        setLocation({
          lat: geoLat,
          lng: geoLng,
          zoom: 12,
          name: 'Votre position'
        });
        setLoading(false);
        return;
      }

      // Si la géolocalisation échoue, essayer par IP
      if (!geoLoading && geoError) {
        try {
          const ipLocation = await getLocationByIP();
          if (ipLocation) {
            setLocation({
              lat: ipLocation.latitude,
              lng: ipLocation.longitude,
              zoom: 10,
              name: ipLocation.city || 'Votre région'
            });
          } else {
            // Fallback sur Paris
            setLocation({
              lat: DEFAULT_LOCATION.latitude,
              lng: DEFAULT_LOCATION.longitude,
              zoom: 10,
              name: DEFAULT_LOCATION.city || 'Paris'
            });
          }
        } catch (error) {
          // Fallback sur Paris
          setLocation({
            lat: DEFAULT_LOCATION.latitude,
            lng: DEFAULT_LOCATION.longitude,
            zoom: 10,
            name: DEFAULT_LOCATION.city || 'Paris'
          });
        }
        setLoading(false);
        return;
      }

      // Si on attend encore la géolocalisation, ne rien faire
      if (geoLoading) {
        return;
      }
    }

    determineLocation();
  }, [searchParams, geoLat, geoLng, geoLoading, geoError]);

  const handleUseMyLocation = () => {
    if (geoLat && geoLng) {
      setLocation({
        lat: geoLat,
        lng: geoLng,
        zoom: 14, // Zoom plus proche pour la position personnelle
        name: 'Votre position'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Détermination de votre position...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Impossible de déterminer votre position</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {/* Bouton de géolocalisation */}
      {geoLat && geoLng && (
        <div className="absolute top-4 right-4 z-[1000]">
          <Button
            onClick={handleUseMyLocation}
            size="sm"
            variant="outline"
            className="bg-white shadow-md"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Ma position
          </Button>
        </div>
      )}
      
      <MapComponent 
        initialLat={location.lat}
        initialLng={location.lng}
        initialZoom={location.zoom}
        locationName={location.name}
        initialInitiatives={initialInitiatives}
      />
    </div>
  );
}
