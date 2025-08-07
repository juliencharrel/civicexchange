"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../ui/button";
import { ThumbsUp, ThumbsUpIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export default function InitiativeCard({
  id,
  title,
  description,
  category,
  status,
  jurisdiction,
  jurisdiction_type,
  country,
  organizing_body,
  start_date,
  end_date,
  objectives,
  outcomes,
  links,
  votes_count = 0,
  userHasVoted = false,
  userId = null,
}: {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  jurisdiction: string;
  jurisdiction_type?: string;
  country?: string;
  organizing_body?: string;
  start_date?: string;
  end_date?: string;
  objectives?: string;
  outcomes?: string;
  links?: unknown;
  votes_count?: number;
  userHasVoted?: boolean;
  userId?: string | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [hasVoted, setHasVoted] = useState(userHasVoted);
  const [voteCount, setVoteCount] = useState(votes_count);
  const [isVoting, setIsVoting] = useState(false);

  // Récupérer l'utilisateur côté client si userId est fourni
  useEffect(() => {
    const getUser = async () => {
      if (userId) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } else {
        setUser(null);
      }
    };
    
    getUser();
  }, [userId]);

  // Mettre à jour l'état de vote si userHasVoted change
  useEffect(() => {
    setHasVoted(userHasVoted);
  }, [userHasVoted]);

  const handleVote = async () => {
    if (!user) {
      alert("Vous devez être connecté pour voter");
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
          console.log(error);

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

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[var(--color-secondary)] font-bold">{category || "Initiative"}</span>
        <span className="text-gray-400 text-xs">{jurisdiction}</span>
        {country && <span className="text-gray-400 text-xs">({country})</span>}
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-gray-600 mb-2">{description}</p>
      <div className="mb-2 text-xs text-gray-500">
        <span className="mr-2">Statut: {status}</span>
        <span className="mr-2">Type: {jurisdiction_type}</span>
        {organizing_body && <span className="mr-2">Organisme: {organizing_body}</span>}
      </div>
      <div className="mb-2 text-xs text-gray-500">
        {start_date && <span className="mr-2">Début: {start_date}</span>}
        {end_date && <span className="mr-2">Fin: {end_date}</span>}
      </div>
      {objectives && <div className="mb-2"><span className="font-semibold">Objectifs:</span> {objectives}</div>}
      {outcomes && <div className="mb-2"><span className="font-semibold">Résultats:</span> {outcomes}</div>}
      {Array.isArray(links) && links.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Liens:</span>
          <ul className="list-disc ml-5">
            {links.map((link: string, i: number) => (
              <li key={i}><a href={link} className="text-[var(--color-primary)] underline" target="_blank" rel="noopener noreferrer">{link}</a></li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Section de vote */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
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
      </div>
    </div>
  );
}