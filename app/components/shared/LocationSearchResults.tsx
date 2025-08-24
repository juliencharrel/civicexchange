import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { NominatimPlace } from "@/hooks/useLocationSearch";

interface LocationSearchResultsProps {
  results: NominatimPlace[];
  showResults: boolean;
  loading: boolean;
  input: string;
  onSelect: (place: NominatimPlace) => void;
}

export default function LocationSearchResults({
  results,
  showResults,
  loading,
  input,
  onSelect
}: LocationSearchResultsProps) {
  if (!showResults) return null;

  if (loading) {
    return (
      <Card className="absolute z-[9999] w-full mt-1 border shadow-lg bg-white">
        <div className="p-4 text-center text-sm text-gray-500">
          Recherche en cours...
        </div>
      </Card>
    );
  }

  if (results.length === 0 && input.length >= 3) {
    return (
      <Card className="absolute z-[9999] w-full mt-1 border shadow-lg bg-white">
        <div className="p-4 text-center text-sm text-gray-500">
          Aucun lieu trouvé pour &quot;{input}&quot;
        </div>
      </Card>
    );
  }

  if (results.length === 0) return null;

  return (
    <Card className="absolute z-[9999] w-full mt-1 max-h-60 overflow-auto border shadow-lg bg-white">
      <div className="p-1">
        {results.map((place) => (
          <div
            key={place.place_id}
            onClick={() => onSelect(place)}
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
  );
}
