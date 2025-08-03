import DomainCard from "./DomainCard";

export default function DomainsSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Domaines d’innovation territoriale</h2>
        <p className="mb-8 text-gray-600">Explorez les initiatives par secteur avec métriques de performance et tendances d’adoption</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <DomainCard />
          <DomainCard />
          <DomainCard />
          <DomainCard />
          <DomainCard />
          <DomainCard />
        </div>
      </div>
    </section>
  );
}