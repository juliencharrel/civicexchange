"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Si on a un utilisateur initial, on n'est plus en chargement
    if (initialUser) {
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  }, [initialUser]);

  const signOut = async () => {
    console.log('Déconnexion en cours...');
    console.log('Utilisateur actuel:', user?.email);
    
    try {
      console.log('Appel de supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      console.log('Résultat de signOut:', { error });
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } else {
        console.log('Déconnexion réussie');
        // Rediriger après déconnexion réussie
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
