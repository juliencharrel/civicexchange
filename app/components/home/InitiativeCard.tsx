import Button from "../ui/Button";

export default function InitiativeCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-secondary font-bold">Participation citoyenne</span>
        <span className="text-gray-400 text-xs">450,000 hab.</span>
      </div>
      <h3 className="text-lg font-bold mb-1">Budget participatif numérique – Toulouse</h3>
      <p className="text-gray-600 mb-4">Plateforme collaborative permettant aux citoyens de proposer et voter pour des projets municipaux avec un budget dédié de 2M€.</p>
      <div className="flex flex-wrap gap-6 mb-4">
        <div>
          <div className="text-primary font-bold">+230%</div>
          <div className="text-xs text-gray-500">Satisfaction</div>
        </div>
        <div>
          <div className="text-primary font-bold">89%</div>
          <div className="text-xs text-gray-500">Adoption</div>
        </div>
        <div>
          <div className="text-primary font-bold">15,000</div>
          <div className="text-xs text-gray-500">Participants</div>
        </div>
        <div>
          <div className="text-primary font-bold">2M€</div>
          <div className="text-xs text-gray-500">Budget</div>
        </div>
      </div>
      <Button variant="primary">Consulter le dossier complet</Button>
    </div>
  );
}