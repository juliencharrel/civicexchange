"use client";
import { useState } from "react";
import LoginForm from "./LoginForm";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bienvenue sur Cursor</h1>
      {user ? (
        <>
          <p className="mb-4">Connecté en tant que : <strong>{user.email}</strong></p>
        </>
      ) : showLogin ? (
        <LoginForm onLoginSuccess={(u) => { setUser(u); setShowLogin(false); }} />
      ) : (
        <button
          onClick={() => setShowLogin(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      )}
    </div>
  );
}
