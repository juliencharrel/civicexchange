"use client";
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapEventsProps {
  onMapMove: () => void;
}

export default function MapEvents({ onMapMove }: MapEventsProps) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      onMapMove();
    };

    const handleZoomEnd = () => {
      onMapMove();
    };

    // Ajouter les événements
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);

    // Cleanup
    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onMapMove]);

  return null;
}
