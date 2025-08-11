"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2, X } from "lucide-react";
import type { Jurisdiction } from "@/types/initiative";

interface NominatimPlace {
  place_id: number;
  osm_id: string;
  osm_type: string;
  display_name: string;
  class: string;
  type: string;
  place_rank: number;
  addresstype?: string;
  address?: {
    country?: string;
    state?: string;
    region?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
  lat: string;
  lon: string;
}

interface JurisdictionAutocompleteProps {
  onSelect: (jurisdiction: Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'>) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
}

function filterPlaces(data: NominatimPlace[]): NominatimPlace[] {
  return data.filter(place => {
    if (place.class !== 'boundary' && place.class !== 'place') return false;
    
    // Ville
    if (place.addresstype && ['city', 'municipality', 'town', 'village'].includes(place.addresstype)) {
      return true;
    }
    
    // Région
    if (place.addresstype && ['state', 'region'].includes(place.addresstype)) {
      return true;
    }
    
    // Pays
    if (place.addresstype === 'country') {
      return true;
    }
    
    // Sinon fallback : check adresse
    if (place.address) {
      if (place.address.city || place.address.municipality || place.address.town || place.address.village) {
        return true;
      }
      if (place.address.state || place.address.region) {
        return true;
      }
      if (place.address.country && !place.address.state) {
        return true;
      }
    }

    return false;
  });
}

export default function JurisdictionAutocomplete({ 
  onSelect, 
  placeholder = "Tapez une ville, région ou pays (min. 3 lettres)",
  value = "",
  disabled = false
}: JurisdictionAutocompleteProps) {
  const [input, setInput] = useState(value);
  const [results, setResults] = useState<NominatimPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("");
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer les résultats si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mettre à jour l'input si la value change
  useEffect(() => {
    setInput(value);
  }, [value]);

  async function search(text: string) {
    if (text.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    // Ne pas mettre showResults à true ici, on le fera après avoir reçu les résultats

    try {
      // Une seule requête large
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(text)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=15&` +
        `accept-language=fr,en`
      );
      
      if (!response.ok) throw new Error('Erreur de recherche');
      
      const data: NominatimPlace[] = await response.json();

      // Debug: logger les addresstype pour voir les valeurs possibles
      console.log('Nominatim results:', data.map(place => ({
        name: place.display_name.split(',')[0],
        addresstype: place.addresstype,
        class: place.class,
        type: place.type
      })));

      // Utiliser la fonction de filtrage améliorée
      const filtered = filterPlaces(data);
      
      setResults(filtered);
      setShowResults(filtered.length > 0);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    setSelectedJurisdiction("");

    // Debounce la recherche
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      search(val);
    }, 300);
  }

  function selectPlace(place: NominatimPlace) {
    const displayName = place.display_name;
    const shortName = place.address?.city || 
                     place.address?.town || 
                     place.address?.village || 
                     place.address?.county ||
                     place.address?.state ||
                     place.address?.region ||
                     place.address?.country ||
                     displayName.split(',')[0];

    // Afficher le nom court dans l'input
    setInput(shortName);
    setSelectedJurisdiction(displayName);
    setResults([]);
    setShowResults(false);

    // Déterminer le type de juridiction basé sur addresstype
    let jurisdictionType: Jurisdiction['type'] = 'city';
    
    // D'abord check addresstype
    if (place.addresstype) {
      if (['city', 'municipality', 'town', 'village'].includes(place.addresstype)) {
        jurisdictionType = 'city';
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

  function clearSelection() {
    setInput("");
    setSelectedJurisdiction("");
    setResults([]);
    setShowResults(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          value={input}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
        />
        
        {/* Icône de chargement ou bouton clear */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : selectedJurisdiction ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={clearSelection}
            >
              <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            </Button>
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Résultats de recherche */}
      {showResults && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-lg bg-white">
          <div className="p-1">
            {results.map((place) => (
              <div
                key={place.place_id}
                onClick={() => selectPlace(place)}
                className="cursor-pointer p-3 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {place.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {place.display_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {(() => {
                          // D'abord check addresstype
                          if (place.addresstype) {
                            if (['city', 'municipality', 'town', 'village'].includes(place.addresstype)) {
                              return 'city';
                            } else if (['state', 'region'].includes(place.addresstype)) {
                              return 'region';
                            } else if (place.addresstype === 'country') {
                              return 'country';
                            }
                          }
                          
                          // Fallback basé sur l'adresse
                          if (place.address?.country && !place.address?.state) {
                            return 'country';
                          } else if (place.address?.state || place.address?.region) {
                            return 'region';
                          } else if (place.address?.city || place.address?.municipality || place.address?.town || place.address?.village) {
                            return 'city';
                          }
                          
                          return place.addresstype || place.type;
                        })()}
                      </span>
                      {place.address?.country && (
                        <span className="text-xs text-gray-400">
                          {place.address.country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Message si pas de résultats */}
      {showResults && !loading && results.length === 0 && input.length >= 3 && (
        <Card className="absolute z-50 w-full mt-1 border shadow-lg bg-white">
          <div className="p-4 text-center text-sm text-gray-500">
            Aucun lieu trouvé pour &quot;{input}&quot;
          </div>
        </Card>
      )}
    </div>
  );
}