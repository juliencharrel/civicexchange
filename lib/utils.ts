import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SupabaseClient } from "@supabase/supabase-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour créer ou trouver une juridiction
export async function upsertJurisdiction(supabase: SupabaseClient, jurisdictionData: {
  name: string;
  country_code?: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  osm_id: number;
  osm_type: string;
  type: 'city' | 'region' | 'country';
}) {
  // Vérifier si la juridiction existe déjà
  const { data: existingJurisdiction } = await supabase
    .from('jurisdictions')
    .select('id')
    .eq('osm_id', jurisdictionData.osm_id)
    .eq('osm_type', jurisdictionData.osm_type)
    .single();

  if (existingJurisdiction) {
    return { id: existingJurisdiction.id, isNew: false };
  } else {
    // Créer une nouvelle juridiction
    const { data: newJurisdiction, error: jurisdictionError } = await supabase
      .from('jurisdictions')
      .insert([{
        name: jurisdictionData.name,
        country_code: jurisdictionData.country_code || '',
        country: jurisdictionData.country || '',
        region: jurisdictionData.region || '',
        latitude: jurisdictionData.latitude,
        longitude: jurisdictionData.longitude,
        osm_id: jurisdictionData.osm_id,
        osm_type: jurisdictionData.osm_type,
        type: jurisdictionData.type,
      }])
      .select('id')
      .single();

    if (jurisdictionError) {
      throw new Error(`Erreur lors de la création de la juridiction: ${jurisdictionError.message}`);
    }
    
    return { id: newJurisdiction.id, isNew: true };
  }
}
