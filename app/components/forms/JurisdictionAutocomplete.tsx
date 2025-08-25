"use client";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import type { Jurisdiction } from "@/types/database";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import LocationSearchResults from "@/components/shared/LocationSearchResults";

interface JurisdictionAutocompleteProps {
  onSelect: (jurisdiction: Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'>) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
}

export default function JurisdictionAutocomplete({ 
  onSelect, 
  placeholder = "Tapez une ville, région ou pays (min. 3 lettres)",
  value = "",
  disabled = false
}: JurisdictionAutocompleteProps) {
  const {
    input,
    setInput,
    results,
    setResults,
    loading,
    showResults,
    selectedJurisdiction,
    setSelectedJurisdiction,
    containerRef,
    handleChange,
    clearSelection,
    setShowResults
  } = useLocationSearch();

  // Mettre à jour l'input si la value change
  useEffect(() => {
    setInput(value);
  }, [value, setInput]);

  function selectPlace(place: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const displayName = place.display_name;
    const shortName = place.address?.city || 
                     place.address?.town || 
                     place.address?.village || 
                     place.address?.county ||
                     place.address?.state ||
                     place.address?.region ||
                     place.address?.country ||
                     displayName.split(',')[0];

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

    // Déterminer le type de juridiction basé sur addresstype
    let jurisdictionType: Jurisdiction['type'] = 'city';
    
    // D'abord check addresstype
    if (place.addresstype) {
      if (['city', 'municipality', 'town', 'village'].includes(place.addresstype)) {
        jurisdictionType = 'city';
      } else if (place.addresstype === 'suburb') {
        jurisdictionType = 'city'; // Les arrondissements sont traités comme des villes
      } else if (['state', 'region'].includes(place.addresstype)) {
        jurisdictionType = 'region';
      } else if (place.addresstype === 'country') {
        jurisdictionType = 'country';
      }
    } else {
      // Fallback basé sur l'adresse
      if (place.address?.country && !place.address?.state) {
        jurisdictionType = 'country';
      } else if (place.address?.state || place.address?.region) {
        jurisdictionType = 'region';
      } else if (place.address?.city || place.address?.municipality || place.address?.town || place.address?.village) {
        jurisdictionType = 'city';
      } else {
        jurisdictionType = 'city'; // fallback par défaut
      }
    }

    // Créer l'objet jurisdiction
    const jurisdiction: Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'> = {
      name: shortName,
      country_code: place.address?.country?.substring(0, 2).toUpperCase() || '',
      country: place.address?.country || '',
      region: place.address?.state || place.address?.region || '',
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      osm_id: parseInt(place.osm_id),
      osm_type: place.osm_type,
      type: jurisdictionType
    };

    onSelect(jurisdiction);
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
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          value={input}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${selectedJurisdiction ? 'bg-blue-50 border-blue-200' : ''}`}
          onFocus={handleFocus}
          onClick={handleInputClick}
        />
        
        {/* Icône de chargement ou bouton clear */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
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
            <MapPin className="h-4 w-4 text-gray-400" />
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