"use client";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { Initiative } from '@/types/database';

// Import dynamique du composant de carte avec géolocalisation
const MapWithGeolocation = dynamic(() => import('./MapWithGeolocation'), {
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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    }>
      <MapWithGeolocation 
        searchParams={searchParams}
        initialInitiatives={initialInitiatives}
      />
    </Suspense>
  );
}
