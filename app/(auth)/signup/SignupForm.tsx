"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { User, Mail, Lock, UserPlus, Check } from "lucide-react";

const supabase = createClient();

interface SignupFormProps {
  onSignupSuccess?: () => void;
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Créer l'utilisateur avec Supabase
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName
          }
        }
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.user) {
        // Le profil sera créé automatiquement par le trigger
        setSuccess(true);
        onSignupSuccess?.();
      }
    } catch {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inscription réussie !</h3>
            <p className="text-gray-600 mb-4">
              Un email de confirmation a été envoyé à <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation pour activer votre compte.
            </p>
            <Button 
              onClick={() => onSignupSuccess?.()}
              className="w-full"
              variant="default"
            >
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Créer un compte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Nom d&apos;affichage</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="displayName"
                type="text"
                placeholder="Votre nom d&apos;affichage"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center gap-2"
          >
            {loading ? (
              "Création du compte..."
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Créer mon compte
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
