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
  
  let initiatives = [];
  
  // Si on a des coordonnées dans l'URL, récupérer les initiatives dans cette zone
  if (params.lat && params.lng) {
    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);
    const zoom = params.zoom ? parseInt(params.zoom) : 10;
    
    // Calculer les bounds basées sur le zoom et les coordonnées
    const zoomLevel = Math.max(0, zoom - 2); // Zone adaptée au zoom
    const latDelta = 0.1 * Math.pow(2, 10 - zoomLevel);
    const lngDelta = 0.1 * Math.pow(2, 10 - zoomLevel);
    
    const { data: initiativesData, error } = await supabase
      .from('initiatives')
      .select(`
        *,
        jurisdiction:jurisdictions!inner(*)
      `)
      .gte('jurisdiction.latitude', lat - latDelta)
      .lte('jurisdiction.latitude', lat + latDelta)
      .gte('jurisdiction.longitude', lng - lngDelta)
      .lte('jurisdiction.longitude', lng + lngDelta)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des initiatives:', error);
    } else {
      initiatives = initiativesData || [];
    }
  } else {
    // Si pas de coordonnées dans l'URL, essayer de récupérer la position par IP
    try {
      // Récupérer l'IP du client
      const { headers } = await import('next/headers');
      const headersList = await headers();
      const forwarded = headersList.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
      
      // Utiliser un service de géolocalisation par IP (exemple avec ipapi.co)
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const locationData = await response.json();
      
      if (locationData.latitude && locationData.longitude) {
        const lat = parseFloat(locationData.latitude);
        const lng = parseFloat(locationData.longitude);
        
        // Récupérer les initiatives autour de cette position
        const latDelta = 0.5; // Zone large pour le chargement initial
        const lngDelta = 0.5;
        
        const { data: initiativesData, error } = await supabase
          .from('initiatives')
          .select(`
            *,
            jurisdiction:jurisdictions!inner(*)
          `)
          .gte('jurisdiction.latitude', lat - latDelta)
          .lte('jurisdiction.latitude', lat + latDelta)
          .gte('jurisdiction.longitude', lng - lngDelta)
          .lte('jurisdiction.longitude', lng + lngDelta)
          .order('created_at', { ascending: false });

        if (!error) {
          initiatives = initiativesData || [];
        }
      }
    } catch (error) {
      console.error('Erreur lors de la géolocalisation par IP:', error);
    }
  }

  return <MapPageClient searchParams={params} initialInitiatives={initiatives} />;
}
