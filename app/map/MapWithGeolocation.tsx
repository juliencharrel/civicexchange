"use client";
import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getLocationByIP, DEFAULT_LOCATION } from '@/lib/geolocation';
import MapComponent from './MapComponent';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import type { Initiative } from '@/types/database';

interface MapWithGeolocationProps {
  searchParams: {
    lat?: string;
    lng?: string;
    zoom?: string;
    name?: string;
  };
  initialInitiatives: Initiative[];
}

export default function MapWithGeolocation({ searchParams, initialInitiatives }: MapWithGeolocationProps) {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    name: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [forceCenter, setForceCenter] = useState(false);
  const [hasRequestedGeolocation, setHasRequestedGeolocation] = useState(false);
  
  const { latitude: geoLat, longitude: geoLng, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation();

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

      // Si on a déjà une géolocalisation, l'utiliser
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

      // Si la géolocalisation a échoué, essayer par IP
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
        } catch {
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

      // Si on n'a pas de géolocalisation et pas d'erreur, essayer par IP par défaut
      if (!geoLoading && !geoError && !geoLat && !geoLng) {
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
        } catch {
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

  // Si on demande la géolocalisation et qu'on l'obtient, mettre à jour la position
  useEffect(() => {
    if (geoLat && geoLng && hasRequestedGeolocation) {
      setLocation({
        lat: geoLat,
        lng: geoLng,
        zoom: 14,
        name: 'Votre position'
      });
      // Forcer le centrage de la carte
      setForceCenter(true);
      setTimeout(() => setForceCenter(false), 100);
      setHasRequestedGeolocation(false); // Reset pour éviter les re-centrages non désirés
    }
  }, [geoLat, geoLng, hasRequestedGeolocation]);

  const handleUseMyLocation = () => {
    // Si on a déjà la géolocalisation, l'utiliser immédiatement
    if (geoLat && geoLng) {
      setLocation({
        lat: geoLat,
        lng: geoLng,
        zoom: 14, // Zoom plus proche pour la position personnelle
        name: 'Votre position'
      });
      // Forcer le centrage de la carte
      setForceCenter(true);
      setTimeout(() => setForceCenter(false), 100);
    } else {
      // Sinon, demander la géolocalisation
      setHasRequestedGeolocation(true);
      getCurrentPosition();
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
      <MapComponent 
        initialLat={location.lat}
        initialLng={location.lng}
        initialZoom={location.zoom}
        locationName={location.name}
        initialInitiatives={initialInitiatives}
        geoLat={geoLat}
        geoLng={geoLng}
        onUseMyLocation={handleUseMyLocation}
        geoLoading={geoLoading}
        forceCenter={forceCenter}
      />
    </div>
  );
}
