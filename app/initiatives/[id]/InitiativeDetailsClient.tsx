"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Calendar, User as UserIcon, ThumbsUp, Edit, ArrowLeft, Globe, Building, Target, Award, Link, MapPin, Tag } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Initiative, Jurisdiction } from "@/types/initiative";

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
}

export default function InitiativeDetailsClient({ 
  initiative, 
  currentUser, 
  userHasVoted: initialUserHasVoted, 
  voteCount: initialVoteCount 
}: InitiativeDetailsClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(currentUser);
  const [userHasVoted, setUserHasVoted] = useState(initialUserHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isVoting, setIsVoting] = useState(false);

  // Gestion de l'authentification en temps réel
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    const setupAuthListener = async () => {
      try {
        const { data } = await supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user || null);
          
          if (session?.user) {
            // Récupérer les votes du nouvel utilisateur
            const { data: votes } = await supabase
              .from("initiatives_votes")
              .select("initiative_id")
              .eq("user_id", session.user.id);
            
            const userVotes = votes?.map(vote => vote.initiative_id) || [];
            setUserHasVoted(userVotes.includes(initiative.id));
          } else {
            setUserHasVoted(false);
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
        subscription.unsubscribe();
      }
    };
  }, [initiative.id]);

  const handleVote = async () => {
    if (!user) {
      // Rediriger vers la page de login
      router.push("/login");
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
              {/* Informations textuelles */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Juridiction</span>
                  </div>
                  <p className="text-gray-900 font-medium">{initiative.jurisdiction?.name || "Non spécifiée"}</p>
                </div>
                
                {initiative.jurisdiction?.type && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Type de juridiction</span>
                    </div>
                    <p className="text-gray-900 font-medium capitalize">{initiative.jurisdiction.type}</p>
                  </div>
                )}
                
                {initiative.jurisdiction?.region && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Région</span>
                    </div>
                    <p className="text-gray-900 font-medium">{initiative.jurisdiction.region}</p>
                  </div>
                )}
                
                {initiative.jurisdiction?.country && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">Pays</span>
                    </div>
                    <p className="text-gray-900 font-medium">{initiative.jurisdiction.country}</p>
                  </div>
                )}
              </div>

              {/* Carte visuelle */}
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
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Zone d&apos;impact de l&apos;initiative
                  </p>
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
        </CardContent>
      </Card>
    </div>
  );
} 