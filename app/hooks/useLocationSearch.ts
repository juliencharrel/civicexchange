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

// Fonction de filtrage et déduplication partagée
function filterPlaces(data: NominatimPlace[]): NominatimPlace[] {
  // 1. Filtrer les types de lieux pertinents
  const relevantPlaces = data.filter(place => {
    // Accepter seulement les boundaries et places
    if (place.class !== 'boundary' && place.class !== 'place') return false;
    
    // Filtrer sur addresstype pour avoir des résultats cohérents
    const validTypes = ['city', 'municipality', 'town', 'village', 'state', 'region', 'country', 'suburb'];
    return place.addresstype && validTypes.includes(place.addresstype);
  });

  // 2. Filtrer les suburb si on a une vraie ville avec le même nom
  const cityNames = new Set(
    relevantPlaces
      .filter(place => ['city', 'municipality', 'town', 'village'].includes(place.addresstype || ''))
      .map(place => place.display_name.split(',')[0].trim())
  );

  const filteredPlaces = relevantPlaces.filter(place => {
    // Si c'est un suburb, vérifier qu'il n'y a pas une vraie ville avec le même nom
    if (place.addresstype === 'suburb') {
      const placeName = place.display_name.split(',')[0].trim();
      return !cityNames.has(placeName);
    }
    return true;
  });

  // 3. Dédupliquer sur display_name en gardant le plus important (place_rank plus élevé)
  const deduplicated = filteredPlaces.reduce((acc: Record<string, NominatimPlace>, place: NominatimPlace) => {
    const key = place.display_name;
    
    // Si on n'a pas encore ce display_name, ou si ce lieu a un place_rank plus élevé (plus important)
    if (!acc[key] || place.place_rank > acc[key].place_rank) {
      acc[key] = place;
    }
    
    return acc;
  }, {});

  // 4. Convertir en array et trier par place_rank (plus important en premier)
  const finalResults = Object.values(deduplicated).sort((a, b) => {
    // Trier par place_rank décroissant (plus important en premier)
    return b.place_rank - a.place_rank;
  });

  return finalResults;
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
      // Requête avec plus de résultats pour avoir plus de choix après déduplication
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(text)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=30&` +
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
