"use client";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import dynamique du composant de carte pour éviter les erreurs SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>
  ),
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

interface MapPageClientProps {
  searchParams: {
    lat?: string;
    lng?: string;
    zoom?: string;
    name?: string;
  };
  initialInitiatives: Initiative[];
}

export default function MapPageClient({ searchParams, initialInitiatives }: MapPageClientProps) {
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : 46.2276; // France par défaut
  const lng = searchParams.lng ? parseFloat(searchParams.lng) : 2.2137;
  const zoom = searchParams.zoom ? parseInt(searchParams.zoom) : 5;
  const name = searchParams.name ? decodeURIComponent(searchParams.name) : '';

  return (
    <div className="h-[calc(100vh-64px)] relative">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      }>
        <MapComponent 
          initialLat={lat}
          initialLng={lng}
          initialZoom={zoom}
          locationName={name}
          initialInitiatives={initialInitiatives}
        />
      </Suspense>
    </div>
  );
}
