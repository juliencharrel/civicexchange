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

  // Récupérer les demandes d'utilisation côté serveur avec les détails utilisateur
  const { data: initiativeRequests, error: requestsError } = await supabase
    .from('initiative_requests')
    .select(`
      id,
      user_id,
      comment,
      created_at,
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

  // Récupérer les profils des utilisateurs séparément
  const userIds = [...new Set(initiativeRequests?.map(req => req.user_id) || [])];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);

  const profilesMap = new Map();
  profiles?.forEach(profile => {
    profilesMap.set(profile.id, profile.display_name);
  });



  // Note: On ne vérifie plus si l'utilisateur a fait une demande
  // car il peut faire plusieurs demandes pour la même initiative dans différentes juridictions

  // Traiter les données des demandes avec les détails utilisateur
  const requestCounts = new Map<string, {
    jurisdiction_id: string;
    jurisdiction_name: string;
    jurisdiction_country: string;
    jurisdiction_region?: string;
    jurisdiction_type: string;
    request_count: number;
    requests: Array<{
      id: string;
      user_id: string;
      user_display_name: string;
      comment?: string;
      created_at: string;
    }>;
  }>();

  initiativeRequests?.forEach((request) => {
    const jurisdiction = request.jurisdiction;
    if (!jurisdiction) return;

    const jurisdictionData = Array.isArray(jurisdiction) ? jurisdiction[0] : jurisdiction;
    const key = jurisdictionData.id;
    
    if (requestCounts.has(key)) {
      const existing = requestCounts.get(key)!;
      existing.request_count++;
              existing.requests.push({
          id: request.id,
          user_id: request.user_id,
          user_display_name: profilesMap.get(request.user_id) || 'Utilisateur',
          comment: request.comment,
          created_at: request.created_at
        });
    } else {
      requestCounts.set(key, {
        jurisdiction_id: jurisdictionData.id,
        jurisdiction_name: jurisdictionData.name,
        jurisdiction_country: jurisdictionData.country,
        jurisdiction_region: jurisdictionData.region,
        jurisdiction_type: jurisdictionData.type,
        request_count: 1,
        requests: [{
          id: request.id,
          user_id: request.user_id,
          user_display_name: profilesMap.get(request.user_id) || 'Utilisateur',
          comment: request.comment,
          created_at: request.created_at
        }]
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