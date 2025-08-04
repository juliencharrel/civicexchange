import { Button } from "../ui/button";

export default function DomainCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="mb-2 text-3xl">🌱</div>
      <h3 className="text-lg font-bold mb-1">Transition énergétique</h3>
      <div className="text-secondary font-bold mb-2">+18%</div>
      <div className="text-xs text-gray-500 mb-4">Réseaux chaleur, photovoltaïque, etc.</div>
      <Button variant="secondary">Voir les détails</Button>
    </div>
  );
}