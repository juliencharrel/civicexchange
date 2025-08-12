"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ThumbsUpIcon, ExternalLink, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Initiative, Jurisdiction } from "../../types/initiative";
import { useAuth } from "../../contexts/AuthContext";

const supabase = createClient();

interface InitiativeCardProps extends Initiative {
  userHasVoted?: boolean;
  jurisdiction?: Jurisdiction;
  requestCount?: number;
}

export default function InitiativeCard({
  id,
  title,
  description,
  category,
  status,
  jurisdiction,
  organizing_body,
  start_date,
  end_date,
  objectives,
  outcomes,
  links,
  votes_count = 0,
  userHasVoted = false,
  requestCount = 0,
}: InitiativeCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = useState(userHasVoted);
  const [voteCount, setVoteCount] = useState(votes_count);
  const [isVoting, setIsVoting] = useState(false);

  // Mettre à jour l'état de vote si userHasVoted change
  useEffect(() => {
    setHasVoted(userHasVoted);
  }, [userHasVoted]);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la navigation vers la page détaillée
    
    if (!user) {
      // Déclencher l'ouverture du modal de login du Header
      const loginButton = document.querySelector('[data-login-trigger]') as HTMLButtonElement;
      if (loginButton) {
        loginButton.click();
      }
      return;
    }

    setIsVoting(true);
    
    try {
      if (hasVoted) {
        // Retirer le vote
        const { error } = await supabase
          .from("initiatives_votes")
          .delete()
          .eq("initiative_id", id)
          .eq("user_id", user.id);

        if (error) throw error;
        
        setHasVoted(false);
        setVoteCount(prev => prev - 1);
      } else {
        // Ajouter le vote
        const { error } = await supabase
          .from("initiatives_votes")
          .insert({
            initiative_id: id,
            user_id: user.id
          });

        if (error) throw error;
        
        setHasVoted(true);
        setVoteCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      alert("Erreur lors du vote. Veuillez réessayer.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/initiatives/${id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-6 mb-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-secondary)] font-bold">{category || "Initiative"}</span>
          <span className="text-gray-400 text-xs">{jurisdiction?.name || "Localisation non spécifiée"}</span>
          {jurisdiction?.country && <span className="text-gray-400 text-xs">({jurisdiction.country})</span>}
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-gray-600 mb-2 line-clamp-2">{description}</p>
      
      <div className="mb-2 text-xs text-gray-500">
        <span className="mr-2">Statut: {status}</span>
        {jurisdiction?.type && <span className="mr-2">Type: {jurisdiction.type}</span>}
        {organizing_body && <span className="mr-2">Organisme: {organizing_body}</span>}
      </div>
      
      <div className="mb-2 text-xs text-gray-500">
        {start_date && <span className="mr-2">Début: {start_date}</span>}
        {end_date && <span className="mr-2">Fin: {end_date}</span>}
      </div>
      
      {objectives && (
        <div className="mb-2 text-sm">
          <span className="font-semibold">Objectifs:</span> 
          <span className="line-clamp-1">{objectives}</span>
        </div>
      )}
      
      {outcomes && (
        <div className="mb-2 text-sm">
          <span className="font-semibold">Résultats:</span> 
          <span className="line-clamp-1">{outcomes}</span>
        </div>
      )}
      
      {Array.isArray(links) && links.length > 0 && (
        <div className="mb-2 text-sm">
          <span className="font-semibold">Liens:</span>
          <span className="text-gray-500"> {links.length} lien{links.length > 1 ? 's' : ''}</span>
        </div>
      )}
      
      {/* Section de vote et requests */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            onClick={handleVote}
            disabled={isVoting}
            className="flex items-center gap-2"
          >
            <ThumbsUpIcon className={`h-4 w-4 ${hasVoted ? 'text-white' : 'text-[var(--color-primary)]'}`} />
            {hasVoted ? "Voté" : "Voter"}
          </Button>
          <span className="text-sm text-gray-600">
            {voteCount} vote{voteCount !== 1 ? 's' : ''}
          </span>
          {requestCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {requestCount} demande{requestCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {jurisdiction?.name}
        </div>
      </div>
    </div>
  );
}