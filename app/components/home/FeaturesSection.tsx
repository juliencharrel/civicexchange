import Button from "../ui/ButtonOld";

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-[var(--color-primary)] text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Accélérez l&apos;innovation dans vos territoires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 rounded-lg p-6">
            <div className="font-bold mb-2">Documentation standardisée</div>
            <div className="text-sm">Templates guidés pour documenter vos initiatives, retours d&apos;expérience, budgets et mesures d&apos;impact.</div>
          </div>
          <div className="bg-white/10 rounded-lg p-6">
            <div className="font-bold mb-2">Réseau d&apos;entraide</div>
            <div className="text-sm">Connectez-vous avec des porteurs d&apos;initiatives similaires. Accès aux retours d&apos;expérience et contacts directs.</div>
          </div>
          <div className="bg-white/10 rounded-lg p-6">
            <div className="font-bold mb-2">Analytics & Benchmarking</div>
            <div className="text-sm">Tableaux de bord et analyses pour vos collectivités similaires. Tableaux comparatifs et alertes.</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-lg p-6">
            <div className="font-bold mb-2">Impact du réseau</div>
            <div className="text-sm">450+ collectivités, 85% taux de succès, 1 200+ initiatives, 350M€ économies générées</div>
          </div>
          <div className="bg-white/10 rounded-lg p-6">
            <div className="font-bold mb-2">Prochains événements</div>
            <div className="text-sm">
              Webinaires, ateliers et salons à venir.{' '}
              <Button
                variant="secondary"
                className="underline ml-1 px-0 py-0 h-auto bg-transparent text-white hover:text-[var(--color-secondary)]"
              >
                Voir l&apos;agenda
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Nom de votre collectivité"
            className="px-4 py-2 rounded text-[var(--color-primary)] w-full md:w-auto"
          />
          <Button variant="primary">Inscrire ma collectivité</Button>
        </div>
      </div>
    </section>
  );
}