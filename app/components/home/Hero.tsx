import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-400 text-white py-16 px-4 md:px-8 lg:px-12">
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Discover <span className="text-blue-200">tangible</span> civic initiatives
          </h1>
          <p className="mb-8 text-lg">Explore, share, and connect with community-driven projects that make a real difference in your neighborhood.</p>
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/map">
              <Button 
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 border-0 font-semibold px-6 py-3 text-base w-full sm:w-auto"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Explore initiatives near me
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            
          
          </div>
        </div>
        <div className="flex-1">
          {/* DashboardCard à insérer ici */}
          <Image width={900} height={400} src="/images/hero_image.png" alt="Dashboard Card" className="bg-white/80 rounded-lg shadow p-6 text-blue-900 min-h-[200px]" />
        </div>
      </div>
    </section>
  );
}