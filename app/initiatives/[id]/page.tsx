import { createClient } from "../../../lib/supabase/server";
import { notFound } from "next/navigation";
import InitiativeDetailsClient from "./InitiativeDetailsClient";
import type { Initiative, Jurisdiction } from "../../types/initiative";

type InitiativeWithDetails = Initiative & {
  author: {
    id: string;
    full_name: string;
    email: string;
  };
  jurisdiction: Jurisdiction;
  details?: string;
  links?: string[];
  organizing_body?: string;
  objectives?: string;
  outcomes?: string;
};

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

  // Récupérer les demandes d'utilisation côté serveur
  const { data: initiativeRequests } = await supabase
    .from('initiative_requests')
    .select(`
      jurisdiction_id,
      jurisdiction:jurisdictions (
        id,
        name,
        country,
        region,
        type
      )
    `)
    .eq('initiative_id', id);

  // Note: On ne vérifie plus si l'utilisateur a fait une demande
  // car il peut faire plusieurs demandes pour la même initiative dans différentes juridictions

  // Traiter les données des demandes
  const requestCounts = new Map<string, {
    jurisdiction_id: string;
    jurisdiction_name: string;
    jurisdiction_country: string;
    jurisdiction_region?: string;
    jurisdiction_type: string;
    request_count: number;
  }>();

  initiativeRequests?.forEach((request) => {
    const jurisdiction = request.jurisdiction;
    if (!jurisdiction) return;

    const jurisdictionData = Array.isArray(jurisdiction) ? jurisdiction[0] : jurisdiction;
    const key = jurisdictionData.id;
    
    if (requestCounts.has(key)) {
      requestCounts.get(key)!.request_count++;
    } else {
      requestCounts.set(key, {
        jurisdiction_id: jurisdictionData.id,
        jurisdiction_name: jurisdictionData.name,
        jurisdiction_country: jurisdictionData.country,
        jurisdiction_region: jurisdictionData.region,
        jurisdiction_type: jurisdictionData.type,
        request_count: 1
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <InitiativeDetailsClient 
          initiative={initiativeWithAuthor as InitiativeWithDetails}
          currentUser={user}
          userHasVoted={userVotes.includes(id)}
          voteCount={voteCount || 0}
          requestCounts={Array.from(requestCounts.values())}
        />
      </div>
    </div>
  );
} 