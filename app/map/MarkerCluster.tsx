"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '@/styles/marker-cluster.css';

// Import dynamique de MarkerClusterGroup
let MarkerClusterGroup: any = null;
if (typeof window !== 'undefined') {
  try {
    MarkerClusterGroup = require('leaflet.markercluster').MarkerClusterGroup;
  } catch (error) {
    console.warn('MarkerClusterGroup not available:', error);
  }
}

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

interface MarkerClusterProps {
  initiatives: Initiative[];
  onMarkerClick: (initiative: Initiative) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onError?: () => void;
}

export default function MarkerCluster({ 
  initiatives, 
  onMarkerClick, 
  getStatusColor, 
  getStatusText,
  onError
}: MarkerClusterProps) {
  const map = useMap();
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!MarkerClusterGroup || !map) {
      console.warn('MarkerClusterGroup or map not available');
      if (onError) onError();
      return;
    }

    // Créer le groupe de clustering
    const clusterGroup = new MarkerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false, // Désactiver le zoom automatique pour permettre le popup
      disableClusteringAtZoom: 16, // Désactiver le clustering au zoom 16+
      iconCreateFunction: function(cluster: any) {
        const count = cluster.getChildCount();
        let className = 'marker-cluster marker-cluster-';
        
        if (count < 5) {
          className += 'small';
        } else if (count < 10) {
          className += 'medium';
        } else {
          className += 'large';
        }
        
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: className,
          iconSize: L.point(40, 40)
        });
      }
    });

    // Ajouter un gestionnaire d'événement pour les clusters
    clusterGroup.on('clusterclick', function(e: any) {
      const cluster = e.layer;
      const markers = cluster.getAllChildMarkers();
      
      if (markers.length > 1) {
        // Créer un popup avec toutes les initiatives du cluster
        const initiativesInCluster = markers.map((marker: any) => marker.initiative).filter(Boolean);
        const firstInitiative = initiativesInCluster[0];
        
        const popupContent = `
          <div class="p-2 min-w-[250px] max-h-[300px] overflow-y-auto">
            <h3 class="font-semibold text-sm mb-2 text-center border-b pb-2">
              ${initiativesInCluster.length} initiative${initiativesInCluster.length > 1 ? 's' : ''} dans cette zone
            </h3>
            <div class="space-y-2">
              ${initiativesInCluster.map((initiative: Initiative) => `
                <div class="border-b border-gray-100 pb-2 last:border-b-0">
                  <h4 class="font-medium text-xs mb-1">${initiative.title}</h4>
                  ${initiative.description ? `
                    <p class="text-xs text-gray-600 mb-1 line-clamp-1">
                      ${initiative.description}
                    </p>
                  ` : ''}
                  <div class="flex items-center justify-between">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(initiative.status || '')}">
                      ${getStatusText(initiative.status || '')}
                    </span>
                    <button 
                      onclick="window.openInitiativeDetails('${initiative.id}')"
                      class="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        // Créer un popup temporaire sur le cluster
        const popup = L.popup()
          .setLatLng(cluster.getLatLng())
          .setContent(popupContent)
          .openOn(map);
        
        // Empêcher le zoom automatique
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
      }
    });

    // Ajouter tous les marqueurs individuellement pour permettre le clustering automatique
    initiatives.forEach((initiative) => {
      if (!initiative.jurisdiction) return;

      const marker = L.marker([
        initiative.jurisdiction.latitude, 
        initiative.jurisdiction.longitude
      ]);

      // Créer le contenu du popup
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-1">${initiative.title}</h3>
          ${initiative.description ? `
            <p class="text-xs text-gray-600 mb-2 line-clamp-2">
              ${initiative.description}
            </p>
          ` : ''}
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(initiative.status || '')}">
              ${getStatusText(initiative.status || '')}
            </span>
            <button 
              onclick="window.openInitiativeDetails('${initiative.id}')"
              class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Voir détails
            </button>
          </div>
        </div>
      `;

      // Stocker l'initiative dans le marqueur pour pouvoir la récupérer plus tard
      (marker as any).initiative = initiative;
      
      marker.bindPopup(popupContent);
      marker.on('click', () => onMarkerClick(initiative));
      clusterGroup.addLayer(marker);
    });

    // Ajouter le groupe à la carte
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Fonction globale pour ouvrir les détails d'une initiative
    (window as any).openInitiativeDetails = (initiativeId: string) => {
      window.open(`/initiatives/${initiativeId}`, '_blank');
    };

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      delete (window as any).openInitiativeDetails;
    };
  }, [initiatives, map, onMarkerClick, getStatusColor, getStatusText]);

  return null;
}
