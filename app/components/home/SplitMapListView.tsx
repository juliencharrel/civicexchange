"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '../../../lib/supabase/client';
import InitiativeCard from '@/components/shared/InitiativeCard';
import { useCategories } from '@/contexts/CategoriesContext';
import { MapPin, Layers, HeartHandshake, BookOpen, ShieldCheck, House, CarFront, Trees, Paintbrush, UserCheck, Building2 as Building3D, MapPin as MapPin3D } from 'lucide-react';
import type { Initiative } from '@/types/database';

// Import dynamique du composant de carte
const SplitMapComponent = dynamic(() => import('./SplitMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

interface SplitMapListViewProps {
  initialInitiatives: Initiative[];
}

export default function SplitMapListView({ initialInitiatives }: SplitMapListViewProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>(initialInitiatives);
  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>(initialInitiatives);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 46.603354,
    lng: 1.888334,
    zoom: 6
  });
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  
  const { categories } = useCategories();
  const supabase = createClient();

  // Function to get 3D icon for category
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('economy') || name.includes('économie')) return Building3D;
    if (name.includes('health') || name.includes('santé')) return HeartHandshake;
    if (name.includes('education') || name.includes('éducation')) return BookOpen;
    if (name.includes('safety') || name.includes('sécurité')) return ShieldCheck;
    if (name.includes('housing') || name.includes('logement')) return House;
    if (name.includes('mobility') || name.includes('mobilité')) return CarFront;
    if (name.includes('environment') || name.includes('environnement')) return Trees;
    if (name.includes('culture')) return Paintbrush;
    if (name.includes('civic') || name.includes('civique')) return UserCheck;
    if (name.includes('community') || name.includes('communauté')) return Building3D;
    if (name.includes('urban') || name.includes('design')) return MapPin3D;
    return Building3D; // Default icon
  };

  // Filtrer les initiatives basé sur la catégorie
  useEffect(() => {
    let filtered = initiatives;

    // Filtre par catégorie
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(initiative => 
        initiative.category_id === selectedCategory
      );
    }

    setFilteredInitiatives(filtered);
  }, [initiatives, selectedCategory]);

  // Charger les initiatives depuis la base de données
  const loadInitiatives = async (bounds?: { north: number; south: number; east: number; west: number }) => {
    setLoading(true);
    try {
      let query = supabase
        .from("initiatives")
        .select(`
          id, title, description, category, category_id, status, organizing_body, start_date, end_date, 
          objectives, outcomes, links, created_at, votes_count, user_id, jurisdiction_id,
          jurisdiction:jurisdictions!inner (
            id,
            name,
            country_code,
            country,
            region,
            type,
            latitude,
            longitude,
            osm_id,
            osm_type
          ),
          category:initiative_categories (
            id,
            name,
            keywords,
            icon
          )
        `)
        .order('created_at', { ascending: false });

      // Si on a des bounds, filtrer par zone géographique
      if (bounds) {
        query = query
          .gte('jurisdiction.latitude', bounds.south)
          .lte('jurisdiction.latitude', bounds.north)
          .gte('jurisdiction.longitude', bounds.west)
          .lte('jurisdiction.longitude', bounds.east);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des initiatives:', error);
        return;
      }

      // Transformer les données
      const transformedInitiatives = data?.map(initiative => ({
        ...initiative,
        jurisdiction: Array.isArray(initiative.jurisdiction) ? initiative.jurisdiction[0] : initiative.jurisdiction,
        category: Array.isArray(initiative.category) ? initiative.category[0] : initiative.category
      })) || [];

      setInitiatives(transformedInitiatives);
    } catch (error) {
      console.error('Erreur lors du chargement des initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les initiatives initiales
  useEffect(() => {
    if (initialInitiatives.length === 0) {
      loadInitiatives();
    }
  }, []);

  const handleMapBoundsChange = (bounds: { north: number; south: number; east: number; west: number }) => {
    loadInitiatives(bounds);
  };

  const handleInitiativeClick = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    // Centrer la carte sur l'initiative
    if (initiative.jurisdiction?.latitude && initiative.jurisdiction?.longitude) {
      setMapCenter({
        lat: initiative.jurisdiction.latitude,
        lng: initiative.jurisdiction.longitude,
        zoom: 14
      });
    }
  };


  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Contenu principal - Split view */}
      <div className="flex-1 flex">
        {/* Barre latérale de catégories */}
        <div className="w-[160px] bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <div className="p-4">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`text-sm px-3 py-2 rounded-md transition-colors flex flex-col items-center gap-1 ${
                  selectedCategory === 'All'
                    ? 'text-white font-bold'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                style={selectedCategory === 'All' ? { backgroundColor: '#3C3CFF' } : {}}
                title="All"
              >
                <Layers className="h-4 w-4" />
                <span className="text-xs">All</span>
              </button>
              {categories.map((category) => {
                const isActive = selectedCategory === category.id;
                const IconComponent = getCategoryIcon(category.name);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`text-sm px-3 py-2 rounded-md transition-colors flex flex-col items-center gap-1 ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                    style={isActive ? { backgroundColor: '#3C3CFF' } : {}}
                    title={category.name}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Liste des initiatives */}
        <div className="w-[400px] bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto">
            {filteredInitiatives.length > 0 ? (
              <div className="p-4 space-y-4">
                {filteredInitiatives.map((initiative) => (
                  <div
                    key={initiative.id}
                    onClick={() => handleInitiativeClick(initiative)}
                    className="cursor-pointer"
                  >
                    <InitiativeCard 
                      initiative={initiative} 
                      variant="map"
                      className={selectedInitiative?.id === initiative.id ? "ring-2 ring-blue-500" : ""}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Aucune initiative trouvée</p>
                <p className="text-sm">
                  {hasActiveFilters 
                    ? "Essayez de modifier vos filtres de recherche" 
                    : "Explorez la carte pour découvrir des initiatives"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Carte */}
        <div className="flex-1 relative">
          <SplitMapComponent
            initialLat={mapCenter.lat}
            initialLng={mapCenter.lng}
            initialZoom={mapCenter.zoom}
            initialInitiatives={filteredInitiatives}
            onBoundsChange={handleMapBoundsChange}
            onInitiativeClick={handleInitiativeClick}
            selectedInitiative={selectedInitiative}
          />
        </div>
      </div>
    </div>
  );
}
