"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createClient } from "../../../lib/supabase/client";
import Link from "next/link";

const supabase = createClient();

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const loadDisplayName = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      
      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      } else {
        // Fallback vers les métadonnées utilisateur
        setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur');
      }
    };
    
    loadDisplayName();
  }, [user]);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 px-3 rounded-md">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">{displayName}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/initiatives/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Publier une initiative</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={signOut}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
