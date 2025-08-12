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
import SignupForm from "../../(auth)/signup/SignupForm";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "./UserMenu";

export default function Header() {
  const { user, signOut } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  return (
    <header className="bg-white border-b fixed top-0 left-0 right-0 z-50">
      
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
          {/* Boutons Login et Signup pour les utilisateurs non connectés */}
          {!user && (
            <>
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="ml-2 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]"
                    variant="ghost"
                  >
                    Connexion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full p-6">
                  <DialogHeader>
                    <DialogTitle>Connexion</DialogTitle>
                    <DialogDescription>
                      Connectez-vous pour publier une initiative ou accéder à votre espace personnel.
                    </DialogDescription>
                  </DialogHeader>
                  <LoginForm
                    onLoginSuccess={() => {
                      setLoginDialogOpen(false);
                    }}
                  />
                  <DialogFooter className="sm:justify-start mt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Fermer
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={signupDialogOpen} onOpenChange={setSignupDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="ml-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                    variant="default"
                  >
                    S'inscrire
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full p-6">
                  <DialogHeader>
                    <DialogTitle>Inscription</DialogTitle>
                    <DialogDescription>
                      Créez votre compte pour accéder à toutes les fonctionnalités.
                    </DialogDescription>
                  </DialogHeader>
                  <SignupForm
                    onSignupSuccess={() => {
                      setSignupDialogOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
          {user && <UserMenu />}
        </nav>
        
      </div>
      {/* Login Modal (shadcn/ui) */}
      {/* The login modal is now only controlled by <Dialog> and <DialogTrigger> (see previous edit) */}
    </header>
  );
}