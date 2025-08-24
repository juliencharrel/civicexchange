import { createClient } from "@/lib/supabase/server";
import MapPageClient from './MapPageClient';

interface MapPageProps {
  searchParams: Promise<{
    lat?: string;
    lng?: string;
    zoom?: string;
    name?: string;
  }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  
  // Récupérer toutes les initiatives avec leurs juridictions en une seule requête
  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select(`
      *,
      jurisdiction:jurisdictions(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des initiatives:', error);
  }

  return <MapPageClient searchParams={params} initialInitiatives={initiatives || []} />;
}
