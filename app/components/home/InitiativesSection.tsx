import { createClient } from "../../../lib/supabase/server";
import InitiativeCard from "./InitiativeCard";

export default async function InitiativesSection() {
  const supabase = await createClient();
  const { data: initiatives, error } = await supabase
    .from("initiatives")
    .select("id, title, description, category, status, jurisdiction, jurisdiction_type, country, organizing_body, start_date, end_date, objectives, outcomes, links, created_at");

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Initiatives territoriales qui performent</h2>
        <p className="mb-8 text-gray-600">Découvrez les initiatives les plus impactantes, documentées avec métriques et retours d’expérience pour faciliter leur adaptation</p>
        <div className="grid gap-6">
          {error && <div className="text-red-600">Erreur lors du chargement des initiatives : {error.message}</div>}
          {initiatives && initiatives.length > 0 ? (
            initiatives.map((initiative) => (
              <InitiativeCard key={initiative.id} {...initiative} />
            ))
          ) : (
            <div>Aucune initiative trouvée.</div>
          )}
        </div>
      </div>
    </section>
  );
}