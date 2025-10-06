import { createClient } from "../lib/supabase/server";
import SplitMapListView from "./components/home/SplitMapListView";
import Footer from "./components/layout/Footer";
import type { Initiative } from "./types/database";

// Forcer le rendu dynamique pour éviter les erreurs de cookies
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  // Récupérer les initiatives avec les juridictions et catégories
  const { data: initiatives, error } = await supabase
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
    .order('created_at', { ascending: false })
    .limit(50); // Limiter à 50 pour les performances

  // Transformer les données pour correspondre au type Initiative
  const transformedInitiatives: Initiative[] = initiatives?.map(initiative => ({
    ...initiative,
    jurisdiction: Array.isArray(initiative.jurisdiction) ? initiative.jurisdiction[0] : initiative.jurisdiction,
    category: Array.isArray(initiative.category) ? initiative.category[0] : initiative.category
  })) || [];

  if (error) {
    console.error('Erreur lors du chargement des initiatives:', error);
  }

  return (
    <>
      <SplitMapListView initialInitiatives={transformedInitiatives} />
      <Footer />
    </>
  );
}
