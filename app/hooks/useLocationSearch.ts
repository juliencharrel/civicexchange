import { useState, useRef, useEffect } from "react";

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

// Fonction de filtrage partagée
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

export function useLocationSearch() {
  const [input, setInput] = useState("");
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

      // Utiliser la fonction de filtrage partagée
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
    
    // Si on modifie l'input et qu'un lieu était sélectionné, on le désélectionne
    if (selectedJurisdiction) {
      setSelectedJurisdiction("");
      setShowResults(false);
    }

    // Debounce la recherche
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      search(val);
    }, 300);
  }

  function clearSelection() {
    setInput("");
    setSelectedJurisdiction("");
    setResults([]);
    setShowResults(false);
  }

  return {
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
    handleChange,
    clearSelection,
    search
  };
}

export type { NominatimPlace };
