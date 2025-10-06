"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, MapPin, FileText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationSearchResults from "@/components/shared/LocationSearchResults";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Initiative } from "@/types/database";

export default function LocationSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const [initiativeResults, setInitiativeResults] = useState<Initiative[]>([]);
  const [initiativeLoading, setInitiativeLoading] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const supabase = createClient();
  
  const {
    input,
    setInput,
    results,
    setResults,
    loading,
    showResults,
    setShowResults,
    selectedJurisdiction,
    setSelectedJurisdiction,
    containerRef,
    handleChange: handleLocationChange,
    clearSelection
  } = useLocationSearch();

  // Function to search initiatives
  const searchInitiatives = async (query: string) => {
    if (query.length < 3) {
      setInitiativeResults([]);
      return;
    }

    setInitiativeLoading(true);
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select(`
          *,
          jurisdiction:jurisdictions!inner(*),
          category:initiative_categories(*)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,organizing_body.ilike.%${query}%`)
        .limit(5);

      if (error) {
        console.error('Error searching initiatives:', error);
        setInitiativeResults([]);
      } else {
        setInitiativeResults(data || []);
      }
    } catch (error) {
      console.error('Error searching initiatives:', error);
      setInitiativeResults([]);
    } finally {
      setInitiativeLoading(false);
    }
  };

  // Clear le champ quand on navigue depuis la page de carte
  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    
    // Si on était sur /map et qu'on navigue vers une autre page, clear le champ
    if (previousPathname === '/map' && pathname !== '/map' && (selectedJurisdiction || selectedInitiative)) {
      clearSelection();
    }
    
    // Mettre à jour le pathname précédent
    previousPathnameRef.current = pathname;
  }, [pathname, selectedJurisdiction, selectedInitiative, clearSelection]);

  // Écouter l'événement de clear depuis la carte
  useEffect(() => {
    const handleClearSearch = () => {
      if (selectedJurisdiction || selectedInitiative) {
        clearSelection();
      }
    };

    window.addEventListener('clearLocationSearch', handleClearSearch);
    return () => {
      window.removeEventListener('clearLocationSearch', handleClearSearch);
    };
  }, [clearSelection, selectedJurisdiction, selectedInitiative]);

  // Combined search function
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    
    // Clear selections if input is modified
    if (selectedJurisdiction || selectedInitiative) {
      setSelectedJurisdiction("");
      setSelectedInitiative(null);
      setShowResults(false);
    }

    // Search both locations and initiatives
    handleLocationChange(e);
    searchInitiatives(val);
  };

  function selectInitiative(initiative: Initiative) {
    setInput(initiative.title);
    setSelectedInitiative(initiative);
    setShowResults(false);
    setResults([]);
    setInitiativeResults([]);

    // Navigate to initiative details page
    router.push(`/initiatives/${initiative.id}`);
  }

  function selectPlace(place: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const displayName = place.display_name;
    
    // Créer un format plus joli pour l'affichage
    const formatDisplayName = () => {
      const parts = displayName.split(',');
      const primary = parts[0].trim();
      const secondary = parts.slice(1, 3).map((p: string) => p.trim()).join(', ');
      
      if (secondary) {
        return `${primary} • ${secondary}`;
      }
      return primary;
    };

    // Afficher le nom formaté dans l'input et marquer comme sélectionné
    const formattedName = formatDisplayName();
    setInput(formattedName);
    setSelectedJurisdiction(formattedName);
    
    // Cacher immédiatement les suggestions et vider les résultats
    setShowResults(false);
    setResults([]);

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    
    // Naviguer vers la page de carte avec les coordonnées
    // Si on est déjà sur la page de carte, faire un zoom adapté
    if (pathname === '/map') {
      // Dispatch un événement pour faire un zoom sur la carte
      window.dispatchEvent(new CustomEvent('zoomToLocation', {
        detail: {
          lat,
          lng: lon,
          zoom: 12,
          name: place.display_name
        }
      }));
    } else {
      // Sinon, naviguer vers la page de carte
      router.push(`/map?lat=${lat}&lng=${lon}&zoom=12&name=${encodeURIComponent(place.display_name)}`);
    }
  }

  // Fonction pour gérer le focus - ne réafficher les suggestions que si on n'a pas de lieu sélectionné
  const handleFocus = () => {
    // Ne rien faire si un lieu est sélectionné
    if (selectedJurisdiction) {
      return;
    }
    
    // Sinon, afficher les suggestions si on en a
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  // Fonction pour gérer le clic sur l'input
  const handleInputClick = () => {
    // Ne rien faire si un lieu est sélectionné
    if (selectedJurisdiction) {
      return;
    }
    
    // Sinon, afficher les suggestions si on en a
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Input
          value={input}
          onChange={handleChange}
          placeholder="Rechercher un lieu..."
          className={`pr-10 ${selectedJurisdiction ? 'bg-blue-50 border-blue-200' : ''}`}
          onFocus={handleFocus}
          onClick={handleInputClick}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : selectedJurisdiction ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent flex items-center justify-center"
              onClick={clearSelection}
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </Button>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* N'afficher les résultats que si aucun lieu n'est sélectionné ET qu'on a des résultats */}
      <LocationSearchResults
        results={results}
        showResults={showResults && !selectedJurisdiction && results.length > 0}
        loading={loading}
        input={input}
        onSelect={selectPlace}
      />
    </div>
  );
}
