"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "../ui/dialog";
import { Button } from "../ui/button";
import LoginForm from "../../(auth)/login/LoginForm";
import { createClient } from "../../../lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient();

export default function Header({ initialUser }: { initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <header className="bg-white border-b">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-xl text-[var(--color-primary)]">CivicExchange</Link>
        {/* Desktop menu */}
        <nav className="flex gap-6 items-center">
          
          {user && (
            <Link href="/initiatives/create" className="ml-4">
              <Button className="bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)]" variant="primary">
                Publier une initiative
              </Button>
            </Link>
          )}
          {/* Remplace la logique conditionnelle du Dialog dans le menu desktop par : */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className={`ml-2 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]${user ? ' hidden' : ''}`}
                variant="ghost"
                onClick={() => setDialogOpen(true)}
              >
                Login
              </Button>
            </DialogTrigger>
            {!user && (
              <DialogContent className="max-w-md w-full p-6">
                <DialogHeader>
                  <DialogTitle>Connexion</DialogTitle>
                  <DialogDescription>
                    Connectez-vous pour publier une initiative ou accéder à votre espace personnel.
                  </DialogDescription>
                </DialogHeader>
                <DialogClose asChild>
                  <button
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
                    aria-label="Fermer"
                  >
                  </button>
                </DialogClose>
                <LoginForm
                  onLoginSuccess={(user) => {
                    setUser(user);
                    setDialogOpen(false);
                  }}
                />
                <DialogFooter className="sm:justify-start mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" onClick={signOut}>
                      Fermer
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
          {user && (
            <Button
              className="ml-2 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]"
              variant="ghost"
              onClick={() => {
                setUser(null);
                setDialogOpen(false);
              }}
            >
              Logout
            </Button>
          )}
        </nav>
        
      </div>
      {/* Login Modal (shadcn/ui) */}
      {/* The login modal is now only controlled by <Dialog> and <DialogTrigger> (see previous edit) */}
    </header>
  );
}