"use client";
import { Fragment, useState } from "react";
import { Menu, MenuItems, MenuItem, Transition, DialogPanel, Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import LoginForm from "../LoginForm";
import { createClient } from "../../utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient();

export default function Header({ initialUser }: { initialUser: User | null }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-xl text-[var(--color-primary)]">CivicExchange</Link>
        {/* Desktop menu */}
        <nav className="hidden md:flex gap-6 items-center">
          
          {user && (
            <Link href="/initiatives/create" passHref legacyBehavior>
              <Button as="a" className="ml-4 bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)]" variant="primary">
                Publier une initiative
              </Button>
            </Link>
          )}
          {user ? (
            <Button
              className="ml-2 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]"
              variant="ghost"
              onClick={signOut}
            >
              Logout
            </Button>
          ) : (
            <Button
              className="ml-2 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]"
              variant="ghost"
              onClick={() => setLoginOpen(true)}
            >
              Login
            </Button>
          )}
        </nav>
        {/* Mobile menu */}
        <div className="md:hidden">
          <Menu as="div" className="relative">
            <Button as={Button} variant="ghost" className="p-2">
              <Bars3Icon className="h-6 w-6 text-[var(--color-primary)]" />
            </Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                <MenuItem>
                  {({ active }) => (
                    <a href="#" className={`block w-full text-left px-4 py-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded transition font-semibold ${active ? "bg-[var(--color-primary-light)]" : ""}`}>Explorer</a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a href="#" className={`block w-full text-left px-4 py-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded transition font-semibold ${active ? "bg-[var(--color-primary-light)]" : ""}`}>Domaines</a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a href="#" className={`block w-full text-left px-4 py-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded transition font-semibold ${active ? "bg-[var(--color-primary-light)]" : ""}`}>Données</a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a href="#" className={`block w-full text-left px-4 py-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded transition font-semibold ${active ? "bg-[var(--color-primary-light)]" : ""}`}>Réseau</a>
                  )}
                </MenuItem>
                {user && (
                  <MenuItem>
                    {({ active }) => (
                      <Link href="/initiatives/create" passHref legacyBehavior>
                        <Button as="a" className="w-full text-left px-4 py-2 bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)]" variant="primary">
                          Publier une initiative
                        </Button>
                      </Link>
                    )}
                  </MenuItem>
                )}
                <MenuItem>
                  {({ active }) => (
                    user ? (
                      <Button
                        className="w-full text-left px-4 py-2 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]"
                        variant="ghost"
                        onClick={signOut}
                      >
                        Logout
                      </Button>
                    ) : (
                      <Button
                        className="w-full text-left px-4 py-2 bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]"
                        variant="ghost"
                        onClick={() => setLoginOpen(true)}
                      >
                        Login
                      </Button>
                    )
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>
      {/* Login Modal */}
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <LoginForm
              onLoginSuccess={(user) => {
                setUser(user);
                setLoginOpen(false);
              }}
            />
          </DialogPanel>
        </div>
      </Dialog>
    </header>
  );
}