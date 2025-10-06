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
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img 
            src="/logo-tangible.svg" 
            alt="Tangible" 
            className="h-8 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'block';
            }}
          />
          <span 
            className="font-bold text-2xl text-[var(--color-primary)] hidden" 
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Tangible
          </span>
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
          
          {/* Post an initiative button for all users */}
          <Link href="/initiatives/create">
            <Button variant="outline">
              Post an initiative
            </Button>
          </Link>
          
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