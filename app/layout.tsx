import "./styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from "../lib/supabase/server";
import Header from "./components/layout/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { CategoriesProvider } from "./contexts/CategoriesContext";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tangible",
  description: "Discover and explore civic initiatives in your community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (error) {
    console.log('Erreur lors de la récupération de l\'utilisateur:', error);
    user = null;
  }

  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider initialUser={user}>
          <CategoriesProvider>
            <Header />
            <main className="pt-16">
              {children}
            </main>
          </CategoriesProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
