"use client";
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface MapEventsProps {
  onMapMove: () => void;
}

export default function MapEvents({ onMapMove }: MapEventsProps) {
  const map = useMap();
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventTimeRef = useRef(0);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const handleMapEvent = () => {
      const now = Date.now();
      
      console.log('🔄 Événement carte reçu:', {
        timestamp: now,
        timeSinceLast: now - lastEventTimeRef.current,
        willIgnore: now - lastEventTimeRef.current < 500 || isProcessingRef.current
      });
      
      // Si le dernier événement était il y a moins de 500ms OU si on est déjà en train de traiter, ignorer
      if (now - lastEventTimeRef.current < 500 || isProcessingRef.current) {
        console.log('❌ Événement ignoré (trop rapide ou déjà en cours)');
        return;
      }
      
      lastEventTimeRef.current = now;
      isProcessingRef.current = true;
      
      // Clear tout timeout précédent
      if (moveTimeoutRef.current) {
        console.log('🗑️ Timeout précédent annulé');
        clearTimeout(moveTimeoutRef.current);
      }
      
      console.log('⏰ Nouveau timeout programmé (300ms)');
      
      // Attendre un peu pour éviter les doubles appels
      moveTimeoutRef.current = setTimeout(() => {
        console.log('🚀 Déclenchement onMapMove');
        onMapMove();
        isProcessingRef.current = false;
      }, 300);
    };

    // Ajouter les événements
    map.on('moveend', handleMapEvent);
    map.on('zoomend', handleMapEvent);

    // Cleanup
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      map.off('moveend', handleMapEvent);
      map.off('zoomend', handleMapEvent);
    };
  }, [map, onMapMove]);

  return null;
}
