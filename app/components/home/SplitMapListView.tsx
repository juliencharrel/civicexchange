"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '../../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Resizer } from '@/components/ui/resizer';
import LocationSearch from '@/components/layout/LocationSearch';
import InitiativeCard from '@/components/shared/InitiativeCard';
import { CategoryButtons } from '@/components/forms/category-buttons';
import { useCategories } from '@/contexts/CategoriesContext';
import { Search, Filter, MapPin, List, Loader2, X } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 46.603354,
    lng: 1.888334,
    zoom: 6
  });
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  
  const { categories } = useCategories();
  const supabase = createClient();

  // Filtrer les initiatives basé sur la recherche et la catégorie
  useEffect(() => {
    let filtered = initiatives;

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(initiative => 
        initiative.category_id === selectedCategory
      );
    }

    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(initiative =>
        initiative.title.toLowerCase().includes(query) ||
        initiative.description?.toLowerCase().includes(query) ||
        initiative.jurisdiction?.name.toLowerCase().includes(query) ||
        initiative.organizing_body?.toLowerCase().includes(query)
      );
    }

    setFilteredInitiatives(filtered);
  }, [initiatives, selectedCategory, searchQuery]);

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

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || searchQuery.trim();

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header avec recherche et filtres */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <LocationSearch />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une initiative..."
                className="w-64"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-blue-50 border-blue-200" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>
        
        {/* Panneau de filtres */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <CategoryButtons
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            />
          </div>
        )}
      </div>

      {/* Contenu principal - Split view */}
      <div className="flex-1 flex">
        {/* Liste des initiatives */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <List className="h-5 w-5" />
                Initiatives ({filteredInitiatives.length})
              </h2>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
          
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
        <div className="w-1/2 relative">
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
