import { createClient } from "../../../lib/supabase/server";
import ClientInitiativesWrapper from "./ClientInitiativesWrapper";

export default async function InitiativesSection() {
  const supabase = await createClient();
  
  // Récupérer l'utilisateur connecté côté serveur
  const { data: { user } } = await supabase.auth.getUser();
  
  // Récupérer les initiatives avec les juridictions
  const { data: initiatives, error } = await supabase
    .from("initiatives")
    .select(`
      id, title, description, category, status, organizing_body, start_date, end_date, 
      objectives, outcomes, links, created_at, votes_count, user_id, jurisdiction_id,
      jurisdiction:jurisdictions (
        id,
        name,
        country_code,
        country,
        region,
        type
      )
    `);

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

  // Si l'utilisateur est connecté, récupérer ses votes pour toutes les initiatives
  let userVotes: string[] = [];
  if (user) {
    const { data: votes } = await supabase
      .from("initiatives_votes")
      .select("initiative_id")
      .eq("user_id", user.id);
    
    userVotes = votes?.map(vote => vote.initiative_id) || [];
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Initiatives territoriales qui performent</h2>
        <p className="mb-8 text-gray-600">Découvrez les initiatives les plus impactantes, documentées avec métriques et retours d&apos;expérience pour faciliter leur adaptation</p>
        <div className="grid gap-6">
          {error && <div className="text-red-600">Erreur lors du chargement des initiatives : {error.message}</div>}
          {initiatives && initiatives.length > 0 ? (
            <ClientInitiativesWrapper 
              initiatives={initiatives}
              initialUser={user}
              initialUserVotes={userVotes}
              requestCountMap={requestCountMap}
            />
          ) : (
            <div>Aucune initiative trouvée.</div>
          )}
        </div>
      </div>
    </section>
  );
}