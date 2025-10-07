"use client";
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '@/styles/marker-cluster.css';
import type { Initiative } from '@/types/database';

// Create custom marker icon with Tangible branding
const createCustomIcon = (color: string = '#3C3CFF') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: relative;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      ">
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

// Use only the main brand color for all markers
const getMarkerIcon = (categoryName?: string) => {
  return createCustomIcon('#3C3CFF'); // Tangible brand color for all markers
};

interface SimpleMapComponentProps {
  initialLat: number;
  initialLng: number;
  initialZoom: number;
  initiatives: Initiative[];
  onInitiativeClick?: (initiative: Initiative) => void;
  selectedInitiative?: Initiative | null;
}

// Composant pour centrer la carte
function MapCenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [map, lat, lng, zoom]);
  
  return null;
}

// Composant pour gérer les clusters de marqueurs
function MarkerCluster({ 
  initiatives, 
  onInitiativeClick, 
  getMarkerIcon 
}: { 
  initiatives: Initiative[]; 
  onInitiativeClick?: (initiative: Initiative) => void;
  getMarkerIcon: (categoryName?: string) => L.DivIcon;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!clusterRef.current) {
      // Créer le groupe de clusters avec style personnalisé
      clusterRef.current = L.markerClusterGroup({
        chunkedLoading: false, // Disable chunked loading for faster rendering
        maxClusterRadius: 80, // Increase radius for better clustering
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 15, // Disable clustering at higher zoom levels
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let size = 'small';
          if (count > 50) size = 'large';
          else if (count > 10) size = 'medium';

          return L.divIcon({
            html: `<div class="marker-cluster marker-cluster-${size}">
                     <span>${count}</span>
                   </div>`,
            className: 'marker-cluster-custom',
            iconSize: L.point(40, 40)
          });
        }
      });
      map.addLayer(clusterRef.current);
    }

    // Nettoyer les marqueurs existants
    clusterRef.current.clearLayers();

    // Ajouter les nouveaux marqueurs
    initiatives.forEach((initiative) => {
      if (!initiative.jurisdiction?.latitude || !initiative.jurisdiction?.longitude) {
        return;
      }

      const markerIcon = getMarkerIcon(initiative.category?.name);
      const marker = L.marker(
        [initiative.jurisdiction.latitude, initiative.jurisdiction.longitude],
        { icon: markerIcon }
      );

      // Ajouter le popup
      marker.bindPopup(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-2 text-gray-900">${initiative.title}</h3>
          <p class="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <span>📍</span>
            ${initiative.jurisdiction.name}
          </p>
          ${initiative.category ? `
            <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full border">
              ${initiative.category.name}
            </span>
          ` : ''}
          ${initiative.description ? `
            <p class="text-xs text-gray-500 mt-2 line-clamp-2">
              ${initiative.description}
            </p>
          ` : ''}
        </div>
      `);

      // Ajouter l'événement de clic
      marker.on('click', () => {
        if (onInitiativeClick) {
          onInitiativeClick(initiative);
        }
      });

      clusterRef.current.addLayer(marker);
    });

    return () => {
      if (clusterRef.current) {
        clusterRef.current.clearLayers();
      }
    };
  }, [initiatives, map, onInitiativeClick, getMarkerIcon]);

  return null;
}

export default function SimpleMapComponent({ 
  initialLat, 
  initialLng, 
  initialZoom, 
  initiatives,
  onInitiativeClick,
  selectedInitiative
}: SimpleMapComponentProps) {
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng, zoom: initialZoom });
  const [mapLoaded, setMapLoaded] = useState(false);

  // Update center when props change
  useEffect(() => {
    setMapCenter({ lat: initialLat, lng: initialLng, zoom: initialZoom });
  }, [initialLat, initialLng, initialZoom]);

  return (
    <div className="h-full w-full relative">
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3C3CFF] mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Chargement de la carte...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapCenter.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        whenReady={() => setMapLoaded(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://api.maptiler.com/maps/dataviz-light/{z}/{x}/{y}.png?key=nARttWq91UBYdpEdw2eg"
        />
        
        <MapCenter lat={mapCenter.lat} lng={mapCenter.lng} zoom={mapCenter.zoom} />
        
        {/* Marker clusters for initiatives */}
        <MarkerCluster 
          initiatives={initiatives}
          onInitiativeClick={onInitiativeClick}
          getMarkerIcon={getMarkerIcon}
        />
      </MapContainer>
    </div>
  );
}
