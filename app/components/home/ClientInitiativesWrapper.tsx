"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import InitiativeCard from "./InitiativeCard";
import type { Initiative } from "../../types/initiative";
import { useAuth } from "../../contexts/AuthContext";

const supabase = createClient();

interface ClientInitiativesWrapperProps {
  initiatives: Initiative[];
  initialUserVotes: string[];
  requestCountMap: Map<string, number>;
}

export default function ClientInitiativesWrapper({ 
  initiatives, 
  initialUserVotes,
  requestCountMap
}: ClientInitiativesWrapperProps) {
  const { user } = useAuth();
  const [userVotes, setUserVotes] = useState<string[]>(initialUserVotes);

  useEffect(() => {
    if (user) {
      // Récupérer les votes de l'utilisateur
      const fetchUserVotes = async () => {
        const { data: votes } = await supabase
          .from("initiatives_votes")
          .select("initiative_id")
          .eq("user_id", user.id);
        
        setUserVotes(votes?.map(vote => vote.initiative_id) || []);
      };
      
      fetchUserVotes();
    } else {
      setUserVotes([]);
    }
  }, [user]);



  return (
    <>
              {initiatives.map((initiative) => (
          <InitiativeCard
            key={initiative.id}
            {...initiative}
            userHasVoted={userVotes.includes(initiative.id)}
            requestCount={requestCountMap.get(initiative.id) || 0}
          />
        ))}
    </>
  );
} 