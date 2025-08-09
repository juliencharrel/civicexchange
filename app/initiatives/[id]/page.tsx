import { createClient } from "../../../lib/supabase/server";
import { notFound } from "next/navigation";
import InitiativeDetailsClient from "./InitiativeDetailsClient";
import type { Initiative, Jurisdiction } from "../../types/initiative";

interface InitiativePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InitiativePage({ params }: InitiativePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  console.log("Recherche de l'initiative avec l'ID:", id);
  
  // Récupérer l'initiative avec la juridiction
  const { data: initiative, error } = await supabase
    .from("initiatives")
    .select(`
      *,
      jurisdiction:jurisdictions (
        id,
        name,
        country_code,
        country,
        region,
        latitude,
        longitude,
        type
      )
    `)
    .eq("id", id)
    .single();


  if (error || !initiative) {
    console.log("Initiative non trouvée, redirection vers 404");
    notFound();
  }

  // Récupérer l'utilisateur qui a créé l'initiative
  const { data: author } = await supabase.auth.admin.getUserById(initiative.user_id);

  // Combiner les données
  const initiativeWithAuthor = {
    ...initiative,
    author: {
      id: author?.user?.id || "",
      full_name: author?.user?.user_metadata?.full_name || "Utilisateur",
      email: author?.user?.email || ""
    }
  };
  
  // Récupérer l'utilisateur actuel
  const { data: { user } } = await supabase.auth.getUser();
  
  // Récupérer les votes de l'utilisateur s'il est connecté
  let userVotes: string[] = [];
  if (user) {
    const { data: votes } = await supabase
      .from("initiatives_votes")
      .select("initiative_id")
      .eq("user_id", user.id);
    
    userVotes = votes?.map((vote: { initiative_id: string }) => vote.initiative_id) || [];
  }

  // Récupérer le nombre total de votes pour cette initiative
  const { count: voteCount } = await supabase
    .from("initiatives_votes")
    .select("*", { count: "exact", head: true })
    .eq("initiative_id", id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <InitiativeDetailsClient 
          initiative={initiativeWithAuthor as Initiative & {
            author: {
              id: string;
              full_name: string;
              email: string;
            };
            jurisdiction: Jurisdiction;
          }}
          currentUser={user}
          userHasVoted={userVotes.includes(id)}
          voteCount={voteCount || 0}
        />
      </div>
    </div>
  );
} 