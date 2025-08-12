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
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const supabase = createClient();

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
  }, [user, supabase]);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
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
