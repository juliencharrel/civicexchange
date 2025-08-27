"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ThumbsUpIcon, ExternalLink, Users, MapPin, Calendar, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Initiative } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";
import { CategoryBadge } from "../ui/category-badge";
import { getStatusColor, getStatusText, formatDate } from "@/lib/initiative-utils";

const supabase = createClient();

interface InitiativeCardProps {
  initiative: Initiative;
  requestCount?: number;
  variant?: "default" | "map";
  className?: string;
}

export default function InitiativeCard({
  initiative,
  requestCount = 0,
  variant = "default",
  className = ""
}: InitiativeCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(initiative.votes_count || 0);
  const [isVoting, setIsVoting] = useState(false);

  // Récupérer l'état de vote de l'utilisateur pour cette initiative
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!user) {
        setHasVoted(false);
        return;
      }

      const { data: vote } = await supabase
        .from("initiatives_votes")
        .select("initiative_id")
        .eq("initiative_id", initiative.id)
        .eq("user_id", user.id)
        .single();
      
      setHasVoted(!!vote);
    };

    fetchUserVote();
  }, [user, initiative.id]);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la navigation vers la page détaillée
    
    if (!user) {
      // Rediriger vers la page d'authentification
      router.push('/auth');
      return;
    }

    setIsVoting(true);
    
    try {
      if (hasVoted) {
        // Retirer le vote
        const { error } = await supabase
          .from("initiatives_votes")
          .delete()
          .eq("initiative_id", initiative.id)
          .eq("user_id", user.id);

        if (error) throw error;
        
        setHasVoted(false);
        setVoteCount((prev: number) => prev - 1);
      } else {
        // Ajouter le vote
        const { error } = await supabase
          .from("initiatives_votes")
          .insert({
            initiative_id: initiative.id,
            user_id: user.id
          });

        if (error) throw error;
        
        setHasVoted(true);
        setVoteCount((prev: number) => prev + 1);
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      alert("Erreur lors du vote. Veuillez réessayer.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/initiatives/${initiative.id}`);
  };



  // Variant map pour la sidebar
  if (variant === "map") {
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${className}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
              {initiative.title}
            </CardTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
              {initiative.category_id && (
                <CategoryBadge categoryId={initiative.category_id} size="sm" />
              )}
              {initiative.status && (
                <Badge className={`text-xs ${getStatusColor(initiative.status)}`}>
                  {getStatusText(initiative.status)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {initiative.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {initiative.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            {initiative.jurisdiction && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{initiative.jurisdiction.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{voteCount}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Voir détails
            </Button>
            
            <Button
              variant={hasVoted ? "default" : "outline"}
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className="text-xs"
            >
              <ThumbsUpIcon className={`h-3 w-3 ${hasVoted ? 'text-white' : 'text-blue-600'}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variant default (pour la home page) - amélioré avec plus de détails
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col h-full ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {initiative.category_id && (
              <CategoryBadge categoryId={initiative.category_id} size="default" />
            )}
            {initiative.category_name && !initiative.category_id && (
              <Badge variant="outline" className="text-xs">
                {initiative.category_name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {initiative.status && (
              <Badge className={getStatusColor(initiative.status)}>
                {getStatusText(initiative.status)}
              </Badge>
            )}
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <CardTitle className="text-lg font-bold line-clamp-2">
          {initiative.title}
        </CardTitle>
        
        {initiative.description && (
          <p className="text-gray-600 line-clamp-2 text-sm">
            {initiative.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Informations de localisation et organisation */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {initiative.jurisdiction && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{initiative.jurisdiction.name}</span>
              {initiative.jurisdiction.country && (
                <span>({initiative.jurisdiction.country})</span>
              )}
            </div>
          )}
          
          {initiative.organizing_body && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>{initiative.organizing_body}</span>
            </div>
          )}
        </div>
        
        {/* Dates */}
        {(initiative.start_date || initiative.end_date) && (
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <Calendar className="h-3 w-3" />
            {initiative.start_date && (
              <span>Début: {formatDate(initiative.start_date)}</span>
            )}
            {initiative.end_date && (
              <span>Fin: {formatDate(initiative.end_date)}</span>
            )}
          </div>
        )}
        
        {/* Objectifs et résultats */}
        {initiative.objectives && (
          <div className="mb-2 text-sm">
            <span className="font-semibold text-gray-700">Objectifs:</span> 
            <span className="text-gray-600 line-clamp-1 ml-1">{initiative.objectives}</span>
          </div>
        )}
        
        {initiative.outcomes && (
          <div className="mb-3 text-sm">
            <span className="font-semibold text-gray-700">Résultats:</span> 
            <span className="text-gray-600 line-clamp-1 ml-1">{initiative.outcomes}</span>
          </div>
        )}
        
        {/* Liens */}
        {Array.isArray(initiative.links) && initiative.links.length > 0 && (
          <div className="mb-3 text-sm">
            <span className="font-semibold text-gray-700">Liens:</span>
            <span className="text-gray-500 ml-1"> {initiative.links.length} lien{initiative.links.length > 1 ? 's' : ''}</span>
          </div>
        )}
        
        {/* Section de vote et requests - justifiée en bas */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-2">
            <Button
              variant={hasVoted ? "default" : "outline"}
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className="flex items-center gap-2"
            >
              <ThumbsUpIcon className={`h-4 w-4 ${hasVoted ? 'text-white' : 'text-blue-600'}`} />
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
            {initiative.jurisdiction?.name}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
