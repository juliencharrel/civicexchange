import Hero from "./components/home/Hero";
import InitiativesSection from "./components/home/InitiativesSection";
import FeaturesSection from "./components/home/FeaturesSection";
import Footer from "./components/layout/Footer";

// Forcer le rendu dynamique pour éviter les erreurs de cookies
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Hero />
      <InitiativesSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
