import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-400 text-white py-16 px-4">
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <span className="inline-block bg-white/20 rounded px-3 py-1 mb-4 text-sm">Plateforme B2B pour élus</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Partagez vos <span className="text-blue-200">innovations</span> territoriales
          </h1>
          <p className="mb-6 text-lg">Explorez, documentez et adoptez les meilleures pratiques municipales. Une plateforme d’échange entre élus et représentants territoriaux.</p>
          <div className="flex gap-8 mt-8">
            <div>
              <div className="text-2xl font-bold">450+</div>
              <div className="text-sm">Collectivités</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1200+</div>
              <div className="text-sm">Initiatives</div>
            </div>
            <div>
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm">Taux de succès</div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          {/* DashboardCard à insérer ici */}
          <div className="bg-white/80 rounded-lg shadow p-6 text-blue-900 min-h-[200px]">DashboardCard (placeholder)</div>
        </div>
      </div>
    </section>
  );
}