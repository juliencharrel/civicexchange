"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Calendar, User as UserIcon, ThumbsUp, Edit, ArrowLeft, Globe, Building, Target, Award, Link, MapPin, Tag, Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Initiative, Jurisdiction } from "@/types/initiative";
import InitiativeRequestsDisplay from "../../components/initiatives/InitiativeRequestsDisplay";
import CreateInitiativeRequest from "../../components/initiatives/CreateInitiativeRequest";
import RequestDetailsDialog from "../../components/initiatives/RequestDetailsDialog";
import Map from "../../components/ui/map";
import { useAuth } from "../../contexts/AuthContext";

const supabase = createClient();

interface InitiativeWithDetails extends Omit<Initiative, 'details' | 'links' | 'organizing_body' | 'objectives' | 'outcomes'> {
  author: {
    id: string;
    full_name: string;
    email: string;
  };
  jurisdiction?: Jurisdiction;
  details?: string;
  links?: string[];
  organizing_body?: string;
  objectives?: string;
  outcomes?: string;
}

interface InitiativeDetailsClientProps {
  initiative: InitiativeWithDetails;
  currentUser: User | null;
  userHasVoted: boolean;
  voteCount: number;
  requestCounts: {
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
  }[];
}

export default function InitiativeDetailsClient({ 
  initiative, 
  currentUser, 
  userHasVoted: initialUserHasVoted, 
  voteCount: initialVoteCount,
  requestCounts
}: InitiativeDetailsClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(currentUser);
  const [userHasVoted, setUserHasVoted] = useState(initialUserHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isVoting, setIsVoting] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequestCount, setSelectedRequestCount] = useState<{
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
  } | null>(null);

  // Utiliser le contexte d'authentification global
  const { user: authUser } = useAuth();
  
  // Mettre à jour l'utilisateur quand le contexte change
  useEffect(() => {
    setUser(authUser);
  }, [authUser]);
  
  // Mettre à jour les votes quand l'utilisateur change
  useEffect(() => {
    if (authUser) {
      const fetchUserVotes = async () => {
        const { data: votes } = await supabase
          .from("initiatives_votes")
          .select("initiative_id")
          .eq("user_id", authUser.id);
        
        const userVotes = votes?.map(vote => vote.initiative_id) || [];
        setUserHasVoted(userVotes.includes(initiative.id));
      };
      
      fetchUserVotes();
    } else {
      setUserHasVoted(false);
    }
  }, [authUser, initiative.id]);

  const handleVote = async () => {
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
      if (userHasVoted) {
        // Retirer le vote
        await supabase
          .from("initiatives_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("initiative_id", initiative.id);
        
        setVoteCount(prev => prev - 1);
        setUserHasVoted(false);
      } else {
        // Ajouter le vote
        await supabase
          .from("initiatives_votes")
          .insert({
            user_id: user.id,
            initiative_id: initiative.id,
          });
        
        setVoteCount(prev => prev + 1);
        setUserHasVoted(true);
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/initiatives/${initiative.id}/edit`);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('initiative_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erreur lors de la suppression:', error);
      } else {
        // Recharger la page pour mettre à jour les données
        router.refresh();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleShowDetails = (requestCount: {
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
  }) => {
    setSelectedRequestCount(requestCount);
    setDetailsDialogOpen(true);
  };

  const handleAddRequest = async (jurisdictionId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('initiative_requests')
        .insert({
          initiative_id: initiative.id,
          jurisdiction_id: jurisdictionId,
          user_id: user.id
        });
      
      if (error) {
        console.error('Erreur lors de la création:', error);
      } else {
        // Recharger la page pour mettre à jour les données
        router.refresh();
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const isCreator = user?.id === initiative.user_id;

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Carte principale */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-gray-900">
                {initiative.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  {initiative.author.full_name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {initiative.created_at ? new Date(initiative.created_at).toLocaleDateString("fr-FR") : "Date inconnue"}
                </div>
                <Badge variant="secondary">
                  {voteCount} vote{voteCount > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {isCreator ? (
                <Button onClick={handleEdit} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>
              ) : (
                <Button 
                  onClick={handleVote}
                  disabled={isVoting}
                  variant={userHasVoted ? "outline" : "default"}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {userHasVoted ? "J'ai voté" : "Voter"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initiative.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Catégorie:</span>
                <Badge variant="outline">{initiative.category}</Badge>
              </div>
            )}
            
            {initiative.status && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Statut:</span>
                <Badge variant={initiative.status === 'ongoing' ? 'default' : 'secondary'}>
                  {initiative.status === 'ongoing' ? 'En cours' : 
                   initiative.status === 'completed' ? 'Terminé' :
                   initiative.status === 'planned' ? 'Planifié' :
                   initiative.status === 'cancelled' ? 'Annulé' : 'Inconnu'}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Localisation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carte interactive */}
              {initiative.jurisdiction?.latitude && initiative.jurisdiction?.longitude ? (
                <Map 
                  latitude={initiative.jurisdiction.latitude}
                  longitude={initiative.jurisdiction.longitude}
                  name={initiative.jurisdiction.name}
                  className="h-80"
                />
              ) : (
                <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Coordonnées non disponibles</p>
                </div>
              )}

              {/* Informations de localisation */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {initiative.jurisdiction?.name || "Non spécifiée"}
                    </h4>
                    {initiative.jurisdiction?.type && (
                      <p className="text-blue-700 font-medium capitalize">
                        {initiative.jurisdiction.type}
                      </p>
                    )}
                    {initiative.jurisdiction?.country && (
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">{initiative.jurisdiction.country}</span>
                      </div>
                    )}
                    {initiative.jurisdiction?.region && (
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <span className="text-xs">{initiative.jurisdiction.region}</span>
                      </div>
                    )}
                  </div>

                  {/* Indicateur visuel décoratif */}
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {initiative.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {initiative.description}
              </p>
            </div>
          )}

          {/* Détails supplémentaires */}
          {initiative.details && typeof initiative.details === 'string' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Détails supplémentaires
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {initiative.details}
              </p>
            </div>
          )}

          {/* Organisme organisateur */}
          {initiative.organizing_body && typeof initiative.organizing_body === 'string' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organisme organisateur
              </h3>
              <p className="text-gray-700">{initiative.organizing_body}</p>
            </div>
          )}

          {/* Dates */}
          {(initiative.start_date || initiative.end_date) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Période
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initiative.start_date && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Date de début:</span>
                    <p className="text-gray-900">{new Date(initiative.start_date).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
                {initiative.end_date && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Date de fin:</span>
                    <p className="text-gray-900">{new Date(initiative.end_date).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Objectifs */}
          {initiative.objectives && typeof initiative.objectives === 'string' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectifs
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {initiative.objectives}
              </p>
            </div>
          )}

          {/* Résultats */}
          {initiative.outcomes && typeof initiative.outcomes === 'string' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Résultats
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {initiative.outcomes}
              </p>
            </div>
          )}

          {/* Liens */}
          {initiative.links && Array.isArray(initiative.links) && initiative.links.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Liens utiles
              </h3>
              <div className="space-y-2">
                {initiative.links.map((link: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {initiative.tags && initiative.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {initiative.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Section des demandes d'utilisation */}
          <Separator />
          
          <div className="space-y-6">
            {/* En-tête avec titre et bouton */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Demandes d&apos;utilisation dans d&apos;autres juridictions ({requestCounts.length})
                </h3>
              </div>
              {user && initiative.jurisdiction ? (
                <CreateInitiativeRequest
                  initiativeId={initiative.id}
                  initiativeTitle={initiative.title}
                  currentJurisdiction={initiative.jurisdiction}
                  onRequestCreated={() => {
                    // Recharger la page pour mettre à jour les données
                    window.location.reload();
                  }}
                />
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    // Déclencher l'ouverture du modal de login du Header
                    const loginButton = document.querySelector('[data-login-trigger]') as HTMLButtonElement;
                    if (loginButton) {
                      loginButton.click();
                    }
                  }}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Se connecter pour demander
                </Button>
              )}
            </div>

            {/* Affichage des demandes existantes */}
            <InitiativeRequestsDisplay 
              requestCounts={requestCounts} 
              currentUser={user}
              onDeleteRequest={handleDeleteRequest}
              onShowDetails={handleShowDetails}
              onAddRequest={handleAddRequest}
            />

            {/* Dialog des détails des demandes */}
            <RequestDetailsDialog
              open={detailsDialogOpen}
              onOpenChange={setDetailsDialogOpen}
              requestCount={selectedRequestCount}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 