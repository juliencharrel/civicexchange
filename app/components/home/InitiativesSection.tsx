import { createClient } from "../../../lib/supabase/server";
import ClientInitiativesWrapper from "./ClientInitiativesWrapper";

export default async function InitiativesSection() {
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
    .limit(6);

  // Transformer les données pour correspondre au type Initiative
  const transformedInitiatives = initiatives?.map(initiative => ({
    ...initiative,
    jurisdiction: Array.isArray(initiative.jurisdiction) ? initiative.jurisdiction[0] : initiative.jurisdiction,
    category: Array.isArray(initiative.category) ? initiative.category[0] : initiative.category
  })) || [];

  // Récupérer le nombre de requests par initiative
  const { data: requestCounts } = await supabase
    .from('initiative_requests')
    .select('initiative_id')
    .not('initiative_id', 'is', null);

  // Compter les requests par initiative
  const requestCountMap = new Map<string, number>();
  requestCounts?.forEach(request => {
    const count = requestCountMap.get(request.initiative_id) || 0;
    requestCountMap.set(request.initiative_id, count + 1);
  });

  return (
    <section className="py-16 px-4 md:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Initiatives territoriales qui performent</h2>
        <p className="mb-8 text-gray-600">Découvrez les initiatives les plus impactantes, documentées avec métriques et retours d&apos;expérience pour faciliter leur adaptation</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && <div className="text-red-600 col-span-full">Erreur lors du chargement des initiatives : {error.message}</div>}
          {transformedInitiatives && transformedInitiatives.length > 0 ? (
            <ClientInitiativesWrapper 
              initiatives={transformedInitiatives}
              requestCountMap={requestCountMap}
            />
          ) : (
            <div className="col-span-full">Aucune initiative trouvée.</div>
          )}
        </div>
      </div>
    </section>
  );
}