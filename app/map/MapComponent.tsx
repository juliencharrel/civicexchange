"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MapEvents from './MapEvents';
import MarkerCluster from './MarkerCluster';
import FallbackMarkers from './FallbackMarkers';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Fix pour les icônes Leaflet
// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Initiative {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  organizing_body?: string;
  start_date?: string;
  end_date?: string;
  objectives?: string;
  outcomes?: string;
  links?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  votes_count?: number;
  user_id: string;
  details?: string;
  tags?: string[];
  jurisdiction_id: number;
  jurisdiction?: {
    id: string;
    name: string;
    country_code: string;
    country: string;
    region?: string;
    latitude: number;
    longitude: number;
    osm_id: number;
    osm_type: string;
    type: 'city' | 'region' | 'country';
  };
}

interface MapComponentProps {
  initialLat: number;
  initialLng: number;
  initialZoom: number;
  locationName: string;
  initialInitiatives: Initiative[];
}

// Composant pour centrer la carte
function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  
  return null;
}

export default function MapComponent({ 
  initialLat, 
  initialLng, 
  initialZoom, 
  locationName
}: MapComponentProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [clusteringAvailable, setClusteringAvailable] = useState(true);

  const mapRef = useRef<L.Map | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateURLTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBoundsRef = useRef<L.LatLngBounds | null>(null);
  const searchStartBoundsRef = useRef<L.LatLngBounds | null>(null);
  const isSearchingRef = useRef(false);

  // Initialisation au montage du composant
  useEffect(() => {
    // Charger les initiatives initiales après que la carte soit prête
    const loadInitialInitiatives = async () => {
      if (!mapRef.current) return;
      
      const bounds = mapRef.current.getBounds();
      await fetchInitiativesInBounds(bounds);
    };

    // Charger après un court délai pour laisser la carte se charger
    const timer = setTimeout(loadInitialInitiatives, 1000);

    // Écouter l'événement de zoom depuis la barre de recherche
    const handleZoomToLocation = (event: CustomEvent) => {
      if (mapRef.current) {
        const { lat, lng, zoom } = event.detail;
        mapRef.current.setView([lat, lng], zoom);
        
        // Mettre à jour l'URL immédiatement quand on zoome depuis la recherche
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', lat.toString());
        params.set('lng', lng.toString());
        params.set('zoom', zoom.toString());
        
        const newURL = `/map?${params.toString()}`;
        router.replace(newURL, { scroll: false });
      }
    };

    window.addEventListener('zoomToLocation', handleZoomToLocation as EventListener);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (updateURLTimeoutRef.current) {
        clearTimeout(updateURLTimeoutRef.current);
      }
      window.removeEventListener('zoomToLocation', handleZoomToLocation as EventListener);
    };
  }, [initialLat, initialLng, searchParams, router]);

  // Fonction pour récupérer les initiatives dans les bounds
  const fetchInitiativesInBounds = useCallback(async (bounds: L.LatLngBounds) => {
    // Si on est déjà en train de chercher, ignorer
    if (isSearchingRef.current) {
      return;
    }
    
    // Vérifier si les bounds ont changé
    if (lastBoundsRef.current && bounds.equals(lastBoundsRef.current)) {
      return;
    }
    
    isSearchingRef.current = true;
    searchStartBoundsRef.current = bounds;
    
    try {
      setLoading(true);
      
      const { data: initiativesData, error: initiativesError } = await supabase
        .from('initiatives')
        .select(`
          *,
          jurisdiction:jurisdictions!inner(*)
        `)
        .gte('jurisdiction.latitude', bounds.getSouth())
        .lte('jurisdiction.latitude', bounds.getNorth())
        .gte('jurisdiction.longitude', bounds.getWest())
        .lte('jurisdiction.longitude', bounds.getEast())
        .order('created_at', { ascending: false });

      if (initiativesError) {
        console.error('Erreur lors de la récupération des initiatives:', initiativesError);
        setInitiatives([]);
        return;
      }

      // Vérifier si la position a changé pendant la recherche
      if (mapRef.current && searchStartBoundsRef.current) {
        const currentBounds = mapRef.current.getBounds();
        if (!currentBounds.equals(searchStartBoundsRef.current)) {
          // La position a changé, annuler cette recherche
          return;
        }
      }
      
      lastBoundsRef.current = bounds;
      setInitiatives(initiativesData || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des initiatives:', error);
      setInitiatives([]);
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }, [supabase]);

  // Fonction pour mettre à jour l'URL avec les coordonnées actuelles (avec debounce)
  const updateURL = useCallback((lat: number, lng: number, zoom: number) => {
    // Clear le timeout précédent
    if (updateURLTimeoutRef.current) {
      clearTimeout(updateURLTimeoutRef.current);
    }
    
    // Débouncer la mise à jour de l'URL
    updateURLTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', lat.toString());
      params.set('lng', lng.toString());
      params.set('zoom', zoom.toString());
      
      // Clear le nom du lieu quand on navigue manuellement
      params.delete('name');
      
      const newURL = `/map?${params.toString()}`;
      router.replace(newURL, { scroll: false });
    }, 300); // Réduit à 300ms pour une meilleure réactivité
  }, [searchParams, router]);

  // Fonction pour clear la barre de recherche dans le header
  const clearHeaderSearch = useCallback(() => {
    // Dispatch un événement personnalisé pour clear la recherche
    window.dispatchEvent(new CustomEvent('clearLocationSearch'));
  }, []);



  // Fonction pour gérer le changement de vue de la carte
  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return;
    
    const bounds = mapRef.current.getBounds();
    
    // Si on est déjà en train de chercher, ignorer
    if (isSearchingRef.current) {
      return;
    }
    
    // Vérifier si les bounds ont changé
    if (lastBoundsRef.current && bounds.equals(lastBoundsRef.current)) {
      return;
    }
    
    // Lancer la recherche
    fetchInitiativesInBounds(bounds);
    
    // Mettre à jour l'URL
    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    updateURL(center.lat, center.lng, zoom);
    
    // Clear la barre de recherche
    clearHeaderSearch();
  }, [fetchInitiativesInBounds, updateURL, clearHeaderSearch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Planifié';
      case 'ongoing': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="flex h-full md:flex-row flex-col">
      {/* Liste des initiatives */}
      <div className="w-full md:w-96 bg-white border-r overflow-y-auto md:h-full h-40 flex-shrink-0">
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {locationName ? `Initiatives à ${locationName}` : 'Initiatives'}
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500 mt-1">Chargement...</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {initiatives.length} initiative{initiatives.length > 1 ? 's' : ''} trouvée{initiatives.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          {initiatives.length === 0 && !loading ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune initiative trouvée dans cette zone</p>
            </div>
          ) : (
            initiatives.map((initiative: Initiative) => (
              <Card 
                key={initiative.id} 
                className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  selectedInitiative?.id === initiative.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedInitiative(initiative)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {initiative.title}
                    </CardTitle>
                    {initiative.status && (
                      <Badge className={`text-xs ${getStatusColor(initiative.status)}`}>
                        {getStatusText(initiative.status)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {initiative.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {initiative.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {initiative.jurisdiction && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{initiative.jurisdiction.name}</span>
                      </div>
                    )}
                    
                    {initiative.votes_count !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{initiative.votes_count}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      asChild
                    >
                      <Link href={`/initiatives/${initiative.id}`}>
                        Voir détails
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1 h-full md:h-full h-60 flex-grow relative">
        {/* Indicateur de chargement sur la carte */}
        {loading && (
          <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-gray-700">Chargement des initiatives...</span>
            </div>
          </div>
        )}
        
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={initialZoom}
          minZoom={3}
          maxZoom={18}
          maxBounds={[[-85, -180], [85, 180]]}
          maxBoundsViscosity={1.0}
          className="h-full w-full [&_.leaflet-popup-content]:m-2 [&_.leaflet-popup-content]:min-w-[200px] [&_.leaflet-popup-content-wrapper]:rounded-lg"
          ref={mapRef}
          whenReady={() => {
            // La carte est prête, les initiatives seront chargées par l'useEffect
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapCenter lat={initialLat} lng={initialLng} />
          <MapEvents onMapMove={handleMapMove} />
          
          {clusteringAvailable ? (
            <MarkerCluster
              initiatives={initiatives}
              onMarkerClick={setSelectedInitiative}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              onError={() => setClusteringAvailable(false)}
            />
          ) : (
            <FallbackMarkers
              initiatives={initiatives}
              onMarkerClick={setSelectedInitiative}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
