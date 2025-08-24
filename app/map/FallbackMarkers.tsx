"use client";
import { Marker, Popup } from 'react-leaflet';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface FallbackMarkersProps {
  initiatives: Initiative[];
  onMarkerClick: (initiative: Initiative) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export default function FallbackMarkers({ 
  initiatives, 
  onMarkerClick, 
  getStatusColor, 
  getStatusText 
}: FallbackMarkersProps) {
  // Grouper les initiatives par coordonnées pour éviter les doublons
  const initiativesByLocation = new Map<string, Initiative[]>();
  
  initiatives.forEach((initiative) => {
    if (!initiative.jurisdiction) return;
    
    const key = `${initiative.jurisdiction.latitude},${initiative.jurisdiction.longitude}`;
    if (!initiativesByLocation.has(key)) {
      initiativesByLocation.set(key, []);
    }
    initiativesByLocation.get(key)!.push(initiative);
  });

  return (
    <>
      {initiativesByLocation.entries().map(([locationKey, initiativesAtLocation]) => {
        const [lat, lng] = locationKey.split(',').map(Number);
        
        if (initiativesAtLocation.length === 1) {
          // Un seul marqueur à cet endroit
          const initiative = initiativesAtLocation[0];
          return (
            <Marker
              key={initiative.id}
              position={[lat, lng]}
              eventHandlers={{
                click: () => onMarkerClick(initiative),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-1">{initiative.title}</h3>
                  {initiative.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {initiative.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(initiative.status || '')}`}>
                      {getStatusText(initiative.status || '')}
                    </Badge>
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <Link href={`/initiatives/${initiative.id}`}>
                        Voir détails
                      </Link>
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        } else {
          // Plusieurs initiatives au même endroit
          return (
            <Marker
              key={locationKey}
              position={[lat, lng]}
              eventHandlers={{
                click: () => onMarkerClick(initiativesAtLocation[0]),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px] max-h-[300px] overflow-y-auto">
                  <h3 className="font-semibold text-sm mb-2 text-center border-b pb-2">
                    {initiativesAtLocation.length} initiative{initiativesAtLocation.length > 1 ? 's' : ''} à {initiativesAtLocation[0].jurisdiction?.name || 'cet endroit'}
                  </h3>
                  <div className="space-y-2">
                    {initiativesAtLocation.map(initiative => (
                      <div key={initiative.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                        <h4 className="font-medium text-xs mb-1">{initiative.title}</h4>
                        {initiative.description && (
                          <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                            {initiative.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getStatusColor(initiative.status || '')}`}>
                            {getStatusText(initiative.status || '')}
                          </Badge>
                          <Button size="sm" variant="outline" className="text-xs" asChild>
                            <Link href={`/initiatives/${initiative.id}`}>
                              Voir détails
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }
      })}
    </>
  );
}
