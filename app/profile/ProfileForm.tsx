"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { User, Save, Check } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useAuth } from "../contexts/AuthContext";

const supabase = createClient();

interface ProfileFormProps {
  user: SupabaseUser;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const { refreshUser, user: authUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le display_name depuis la table profiles
  useEffect(() => {
    if (!authUser) return;
    
    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      
      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      } else {
        // Fallback vers les métadonnées utilisateur
        setDisplayName(user.user_metadata?.full_name || "");
      }
    };
    
    loadProfile();
  }, [user.id, user.user_metadata?.full_name, authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Mettre à jour ou créer le profil dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName
        });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      // Mettre à jour les métadonnées utilisateur pour la compatibilité
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });

      if (authError) {
        console.error('Erreur mise à jour métadonnées:', authError);
        // On continue même si la mise à jour des métadonnées échoue
      }

      setSuccess(true);
      await refreshUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier que l'utilisateur est bien connecté
  if (!authUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          <div>
            <Label htmlFor="displayName">Nom d&apos;affichage</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Votre nom d&apos;affichage"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ce nom sera visible par les autres utilisateurs
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded flex items-center gap-2">
              <Check className="h-4 w-4" />
              Profil mis à jour avec succès !
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              "Mise à jour..."
            ) : (
              <>
                <Save className="h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
