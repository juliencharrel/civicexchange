"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MapEvents from './MapEvents';
import MarkerCluster from './MarkerCluster';
import FallbackMarkers from './FallbackMarkers';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/lib/supabase/client';
import { MapPin } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import InitiativeCard from '@/components/shared/InitiativeCard';
import type { Initiative } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

// Fix pour les icônes Leaflet
// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  initialLat: number;
  initialLng: number;
  initialZoom: number;
  locationName: string;
  initialInitiatives?: Initiative[];
  geoLat?: number | null;
  geoLng?: number | null;
  onUseMyLocation?: () => void;
  geoLoading?: boolean;
  forceCenter?: boolean;
}

// Composant pour centrer la carte
function MapCenter({ lat, lng, zoom, forceCenter }: { lat: number; lng: number; zoom?: number; forceCenter?: boolean }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);
  
  useEffect(() => {
    if (forceCenter || !hasCenteredRef.current) {
      map.setView([lat, lng], zoom || map.getZoom());
      hasCenteredRef.current = true;
    }
  }, [lat, lng, zoom, map, forceCenter]);
  
  return null;
}

export default function MapComponent({ 
  initialLat, 
  initialLng, 
  initialZoom, 
  locationName,
  initialInitiatives,
  geoLat,
  geoLng,
  onUseMyLocation,
  geoLoading,
  forceCenter
}: MapComponentProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>(initialInitiatives || []);
  const [loading, setLoading] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [clusteringAvailable, setClusteringAvailable] = useState(true);
  const [forceCenterState, setForceCenterState] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const mapRef = useRef<L.Map | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateURLTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBoundsRef = useRef<L.LatLngBounds | null>(null);
  const searchStartBoundsRef = useRef<L.LatLngBounds | null>(null);
  const isSearchingRef = useRef(false);

  const CATEGORY_OPTIONS = [
    'All',
    'Economy',
    'Health',
    'Education',
    'Safety',
    'Housing',
    'Mobility',
    'Environment',
    'Culture',
    'Civic',
    'Community',
    'Urban Design',
  ];

  const filteredInitiatives = (selectedCategory === 'All')
    ? initiatives
    : initiatives.filter((initiative) => {
        const name = (initiative as any).category?.name || initiative.category;
        return typeof name === 'string' && name.toLowerCase() === selectedCategory.toLowerCase();
      });

  // Fonction pour gérer le clic sur "Ma position"
  const handleMyLocationClick = () => {
    if (onUseMyLocation) {
      onUseMyLocation();
    }
  };

  // Mettre à jour forceCenterState quand la prop change
  useEffect(() => {
    if (forceCenter) {
      setForceCenterState(true);
      setTimeout(() => setForceCenterState(false), 100);
    }
  }, [forceCenter]);

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
          jurisdiction:jurisdictions!inner(*),
          category:initiative_categories(*)
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

  // Initialisation au montage du composant
  useEffect(() => {
    // Si on a déjà des initiatives initiales du serveur, les utiliser
    if (initialInitiatives && initialInitiatives.length > 0) {
      console.log('✅ Utilisation des initiatives initiales du serveur');
      setInitiatives(initialInitiatives);
    }
    
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
        
        // Recharger les initiatives pour la nouvelle localisation
        setTimeout(() => {
          if (mapRef.current) {
            const bounds = mapRef.current.getBounds();
            // Forcer le rechargement en réinitialisant lastBoundsRef
            lastBoundsRef.current = null;
            fetchInitiativesInBounds(bounds);
          }
        }, 500); // Attendre que la carte soit stabilisée
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
  }, [initialLat, initialLng, searchParams, router, initialInitiatives, fetchInitiativesInBounds]);

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

  console.log('MapComponent rendering with selectedCategory:', selectedCategory);
  
  return (
    <div className="flex h-full md:flex-row flex-col">
      {/* Liste des initiatives avec sidebar */}
      <div className="w-full md:w-[700px] bg-white border-r overflow-y-auto md:h-full h-[50vh] flex-shrink-0 flex">
        {/* Barre latérale de catégories */}
        <div className="w-[200px] bg-red-100 border-r overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Catégories</h3>
            <div className="flex flex-col space-y-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                    }`}
                    title={cat}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu de la liste des initiatives */}
        <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {locationName ? `Initiatives à ${locationName}` : 'Initiatives'}
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500 mt-1">Chargement...</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {filteredInitiatives.length} initiative{filteredInitiatives.length > 1 ? 's' : ''} trouvée{filteredInitiatives.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          {filteredInitiatives.length === 0 && !loading ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune initiative trouvée dans cette zone</p>
            </div>
          ) : (
            filteredInitiatives.map((initiative: Initiative) => (
              <div
                key={initiative.id}
                className={selectedInitiative?.id === initiative.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}
                onClick={() => setSelectedInitiative(initiative)}
              >
                <InitiativeCard
                  initiative={initiative}
                  variant="default"
                  className="mb-0"
                />
              </div>
            ))
          )}
        </div>
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1 h-full md:h-full h-[50vh] flex-grow relative">
        {/* Indicateur de chargement sur la carte */}
        {loading && (
          <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-gray-700">Chargement des initiatives...</span>
            </div>
          </div>
        )}

        {/* Bouton de géolocalisation en bas à droite */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Button
            onClick={handleMyLocationClick}
            size="sm"
            variant="outline"
            className="bg-white shadow-md hover:bg-gray-50 w-10 h-10 p-0"
            title="Ma position"
            disabled={geoLoading}
          >
            {geoLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>
        
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
            attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            url="https://api.maptiler.com/maps/dataviz-light/{z}/{x}/{y}.png?key=nARttWq91UBYdpEdw2eg"
          />
          
                      <MapCenter 
              lat={forceCenterState && geoLat ? geoLat : initialLat} 
              lng={forceCenterState && geoLng ? geoLng : initialLng} 
              zoom={forceCenterState && geoLat && geoLng ? 14 : initialZoom}
              forceCenter={Boolean(forceCenterState && geoLat && geoLng)}
            />
          <MapEvents onMapMove={handleMapMove} />
          
          {clusteringAvailable ? (
            <MarkerCluster
              initiatives={filteredInitiatives}
              onMarkerClick={setSelectedInitiative}
              onError={() => setClusteringAvailable(false)}
            />
          ) : (
            <FallbackMarkers
              initiatives={filteredInitiatives}
              onMarkerClick={setSelectedInitiative}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
