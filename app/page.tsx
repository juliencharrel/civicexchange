"use client";
import Header from "./components/Header";
import Hero from "./components/home/Hero";
import InitiativesSection from "./components/home/InitiativesSection";
import DomainsSection from "./components/home/DomainsSection";
import FeaturesSection from "./components/home/FeaturesSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <InitiativesSection />
      <DomainsSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
