"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import InitiativeCard from "./InitiativeCard";
import type { User } from "@supabase/supabase-js";
import type { Initiative } from "../../types/initiative";

const supabase = createClient();

interface ClientInitiativesWrapperProps {
  initiatives: Initiative[];
  initialUser: User | null;
  initialUserVotes: string[];
}

export default function ClientInitiativesWrapper({ 
  initiatives, 
  initialUser, 
  initialUserVotes 
}: ClientInitiativesWrapperProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [userVotes, setUserVotes] = useState<string[]>(initialUserVotes);

  useEffect(() => {
    let subscription: any = null;
    
    const setupAuthListener = async () => {
      try {
        // Écouter les changements d'authentification
        const { data } = await supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user || null);
          
          if (session?.user) {
            // Récupérer les votes du nouvel utilisateur
            const { data: votes } = await supabase
              .from("initiatives_votes")
              .select("initiative_id")
              .eq("user_id", session.user.id);
            
            setUserVotes(votes?.map(vote => vote.initiative_id) || []);
          } else {
            setUserVotes([]);
          }
        });
        
        subscription = data.subscription;
      } catch (error) {
        console.error("Erreur lors de la configuration de l'écouteur d'authentification:", error);
      }
    };

    setupAuthListener();

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Erreur lors du nettoyage de la subscription:", error);
        }
      }
    };
  }, []);

  return (
    <>
      {initiatives.map((initiative) => (
        <InitiativeCard 
          key={initiative.id} 
          {...initiative} 
          userHasVoted={userVotes.includes(initiative.id)}
          currentUser={user}
        />
      ))}
    </>
  );
} 