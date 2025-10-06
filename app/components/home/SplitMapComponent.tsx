"use client";
import { useEffect, useRef, useCallback, useState } from 'react';
import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadGoogleMapsOnce } from '@/lib/googleMaps';
import type { Initiative } from '@/types/database';

interface SplitMapComponentProps {
  initialLat: number;
  initialLng: number;
  initialZoom: number;
  initialInitiatives: Initiative[];
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onInitiativeClick?: (initiative: Initiative) => void;
  selectedInitiative?: Initiative | null;
  geoLat?: number | null;
  geoLng?: number | null;
  onUseMyLocation?: () => void;
  geoLoading?: boolean;
}


export default function SplitMapComponent({ 
  initialLat, 
  initialLng, 
  initialZoom, 
  initialInitiatives,
  onBoundsChange,
  onInitiativeClick,
  selectedInitiative,
  geoLat,
  geoLng,
  onUseMyLocation,
  geoLoading
}: SplitMapComponentProps) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const selectedMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const hasInitializedCenterRef = useRef(false);
  const boundsThrottleRef = useRef<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedInitiativeDetails, setSelectedInitiativeDetails] = useState<Initiative | null>(null);

  // Fonction pour gérer le clic sur "Ma position"
  const handleMyLocationClick = () => {
    if (onUseMyLocation) {
      onUseMyLocation();
    }
  };

  // Initialize Google Map with new functional API
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    loadGoogleMapsOnce().then(() => {
      
      // Create map with new functional API
      const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
      mapRef.current = new window.google.maps.Map(mapDivRef.current as HTMLDivElement, {
        center: { lat: initialLat, lng: initialLng },
        zoom: initialZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        ...(mapId ? { mapId } : {})
      });

      // Notify initial bounds after idle
      window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
        const bounds = mapRef.current!.getBounds();
        if (bounds && onBoundsChange) {
          onBoundsChange({
            north: bounds.getNorthEast().lat(),
            south: bounds.getSouthWest().lat(),
            east: bounds.getNorthEast().lng(),
            west: bounds.getSouthWest().lng()
          });
        }
      });

      // Throttled bounds change listener
      mapRef.current.addListener('bounds_changed', () => {
        if (!onBoundsChange) return;
        if (boundsThrottleRef.current) {
          window.clearTimeout(boundsThrottleRef.current);
        }
        boundsThrottleRef.current = window.setTimeout(() => {
          const b = mapRef.current!.getBounds();
          if (!b) return;
          onBoundsChange({
            north: b.getNorthEast().lat(),
            south: b.getSouthWest().lat(),
            east: b.getNorthEast().lng(),
            west: b.getSouthWest().lng()
          });
        }, 400);
      });
    }).catch((error) => {
      console.error('Failed to load Google Maps:', error);
      setMapError(error.message);
    });
  }, [initialLat, initialLng, initialZoom, onBoundsChange]);

  // Update center when props change using setOptions
  useEffect(() => {
    if (!mapRef.current) return;
    if (!hasInitializedCenterRef.current) {
      hasInitializedCenterRef.current = true;
      return;
    }
    
    // Use setOptions for better performance
    mapRef.current.setOptions({
      center: { lat: initialLat, lng: initialLng },
      zoom: initialZoom
    });
  }, [initialLat, initialLng, initialZoom]);

  // Render initiative markers using new functional API
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Remove markers that are no longer present
    const existingIds = new Set(Array.from(markersRef.current.keys()));
    const nextIds = new Set(initialInitiatives.map(i => i.id));
    for (const id of existingIds) {
      if (!nextIds.has(id)) {
        const m = markersRef.current.get(id);
        if (m) {
          m.map = null;
          markersRef.current.delete(id);
        }
      }
    }

    // Add/update markers; prefer AdvancedMarkerElement when mapId is present, fallback to standard Marker otherwise
    const createMarkers = async () => {
      const library = await window.google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
      const AdvancedMarkerElement = (library as any).AdvancedMarkerElement;
      const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

      initialInitiatives.forEach((initiative) => {
        const lat = initiative.jurisdiction?.latitude;
        const lng = initiative.jurisdiction?.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const existing = markersRef.current.get(initiative.id);
        if (existing) {
          // Update existing marker position safely across marker types
          if (typeof existing.setPosition === 'function') {
            existing.setPosition({ lat, lng }); // google.maps.Marker
          } else if ('position' in existing) {
            existing.position = { lat, lng }; // AdvancedMarkerElement
          }
          return;
        }

        // Create new marker
        let marker: any;
        if (AdvancedMarkerElement && mapId) {
          marker = new AdvancedMarkerElement({
            position: { lat, lng },
            map: mapRef.current!,
            title: initiative.title
          });
        } else {
          marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapRef.current!,
            title: initiative.title
          });
        }

        // Click handler
        if (typeof marker.addListener === 'function') {
          marker.addListener('click', () => {
            if (onInitiativeClick) onInitiativeClick(initiative);
          });
        } else if (typeof marker.addListener === 'function') {
          marker.addListener('gmp-click', () => {
            if (onInitiativeClick) onInitiativeClick(initiative);
          });
        }

        markersRef.current.set(initiative.id, marker);
      });
    };

    createMarkers();

    // Highlight selected marker (no-op for standard markers)
    if (selectedInitiative) {
      const m = markersRef.current.get(selectedInitiative.id);
      if (m) {
        if (selectedMarkerRef.current && selectedMarkerRef.current !== m) {
          // Reset previous marker styling if needed
          if (typeof selectedMarkerRef.current.setOptions === 'function') {
            selectedMarkerRef.current.setOptions({});
          }
        }
        selectedMarkerRef.current = m;
        
        // Highlight selected marker
        if (typeof m.setOptions === 'function') {
          m.setOptions({});
        }
        
        mapRef.current.panTo(m.position as google.maps.LatLng);
      }
    }
  }, [initialInitiatives, onInitiativeClick, selectedInitiative]);

  // Listen for initiative details events
  useEffect(() => {
    const handleShowInitiativeDetails = (event: CustomEvent) => {
      const { initiative, lat, lng } = event.detail;
      setSelectedInitiativeDetails(initiative);
      
      // Move map to initiative location
      if (mapRef.current && lat && lng) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
      }
    };

    window.addEventListener('showInitiativeDetails', handleShowInitiativeDetails as EventListener);
    
    return () => {
      window.removeEventListener('showInitiativeDetails', handleShowInitiativeDetails as EventListener);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (boundsThrottleRef.current) {
        window.clearTimeout(boundsThrottleRef.current);
      }
      // Clean up markers
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current.clear();
    };
  }, []);

  // Show error message if map failed to load
  if (mapError) {
    const isApiKeyMissing = mapError.includes('API key not found');
    
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-md">
          <div className="text-gray-500 mb-4">
            <Navigation className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">Carte non disponible</h3>
            <p className="text-sm">{mapError}</p>
          </div>
          
          {isApiKeyMissing ? (
            <div className="text-xs text-gray-400">
              <p>Pour activer Google Maps, ajoutez votre clé API dans le fichier .env.local :</p>
              <code className="block mt-2 p-2 bg-gray-200 rounded text-xs">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_clé_api_ici
              </code>
            </div>
          ) : (
            <div className="text-xs text-gray-400 space-y-2">
              <p><strong>Problème avec Google Maps :</strong></p>
              <ul className="text-left space-y-1">
                <li>• Vérifiez que votre clé API est valide</li>
                <li>• Assurez-vous que l'API Maps JavaScript est activée</li>
                <li>• Vérifiez que la facturation est activée sur Google Cloud</li>
                <li>• Vérifiez les restrictions de domaine sur votre clé API</li>
              </ul>
              <p className="mt-2">
                <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Console Google Cloud →
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {(onUseMyLocation || (geoLat && geoLng)) && (
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
      )}

      {/* Initiative Details Tooltip */}
      {selectedInitiativeDetails && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold line-clamp-2">{selectedInitiativeDetails.title}</h3>
            <button
              onClick={() => setSelectedInitiativeDetails(null)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ×
            </button>
          </div>
          
          {selectedInitiativeDetails.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {selectedInitiativeDetails.description}
            </p>
          )}
          
          {selectedInitiativeDetails.jurisdiction && (
            <p className="text-xs text-gray-500 mb-2">
              📍 {selectedInitiativeDetails.jurisdiction.name}
            </p>
          )}
          
          {selectedInitiativeDetails.organizing_body && (
            <p className="text-xs text-gray-500">
              🏢 {selectedInitiativeDetails.organizing_body}
            </p>
          )}
        </div>
      )}

      <div ref={mapDivRef} className="h-full w-full" />
    </div>
  );
}
