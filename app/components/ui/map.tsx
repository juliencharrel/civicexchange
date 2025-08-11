"use client";
import { useEffect, useRef, useState } from 'react';

interface MapProps {
  latitude: number;
  longitude: number;
  name: string;
  className?: string;
}

export default function Map({ latitude, longitude, name, className = "h-64" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      // CSS chargé dynamiquement côté client
      if (typeof window !== 'undefined') {
        // @ts-expect-error - CSS import dynamique
        await import('leaflet/dist/leaflet.css');
      }

      // Fix pour les icônes Leaflet avec Next.js
      // @ts-expect-error - Propriété privée Leaflet
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Créer la carte
      const map = L.default.map(mapRef.current!).setView([latitude, longitude], 12);

      // Ajouter la couche OpenStreetMap
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Ajouter le marqueur
      const marker = L.default.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<b>${name}</b><br>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);

      // Nettoyer à la destruction
      return () => {
        map.remove();
      };
    };

    initMap();
  }, [isClient, latitude, longitude, name]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full rounded-lg border border-gray-200 ${className}`}
    />
  );
}
