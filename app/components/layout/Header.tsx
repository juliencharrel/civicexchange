"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "./UserMenu";
import LocationSearch from "./LocationSearch";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b fixed top-0 left-0 right-0 z-50">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo - texte complet sur desktop, compact sur mobile */}
        <Link href="/" className="font-bold text-xl text-[var(--color-primary)]">
          <span className="hidden md:inline">CivicExchange</span>
          <span className="md:hidden text-lg">CE</span>
        </Link>
        
        {/* Barre de recherche - toujours visible */}
        <div className="flex-1 max-w-md mx-4 md:mx-8">
          <LocationSearch />
        </div>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex gap-6 items-center">
          
          {user && (
            <Link href="/initiatives/create" className="ml-4">
              <Button className="bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)]" variant="primary">
                Publier une initiative
              </Button>
            </Link>
          )}
          
          {/* Bouton d'authentification unifié pour les utilisateurs non connectés */}
          {!user && (
            <Link href="/auth">
              <Button variant="outline">
                Connexion / Inscription
              </Button>
            </Link>
          )}
          
          {user && <UserMenu />}
        </nav>

        {/* Mobile menu - seulement le menu utilisateur */}
        <nav className="md:hidden flex items-center">
          {!user && (
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </Link>
          )}
          
          {user && <UserMenu />}
        </nav>
        
      </div>
    </header>
  );
}