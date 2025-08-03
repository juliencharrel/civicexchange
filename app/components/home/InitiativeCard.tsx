// app/components/home/InitiativeCard.tsx
import Button from "../ui/Button";

export default function InitiativeCard({
  title,
  description,
  category,
  status,
  jurisdiction,
  jurisdiction_type,
  country,
  organizing_body,
  start_date,
  end_date,
  objectives,
  outcomes,
  links,
}: {
  title: string;
  description?: string;
  category?: string;
  status?: string;
  jurisdiction: string;
  jurisdiction_type?: string;
  country?: string;
  organizing_body?: string;
  start_date?: string;
  end_date?: string;
  objectives?: string;
  outcomes?: string;
  links?: any;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[var(--color-secondary)] font-bold">{category || "Initiative"}</span>
        <span className="text-gray-400 text-xs">{jurisdiction}</span>
        {country && <span className="text-gray-400 text-xs">({country})</span>}
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-gray-600 mb-2">{description}</p>
      <div className="mb-2 text-xs text-gray-500">
        <span className="mr-2">Statut: {status}</span>
        <span className="mr-2">Type: {jurisdiction_type}</span>
        {organizing_body && <span className="mr-2">Organisme: {organizing_body}</span>}
      </div>
      <div className="mb-2 text-xs text-gray-500">
        {start_date && <span className="mr-2">Début: {start_date}</span>}
        {end_date && <span className="mr-2">Fin: {end_date}</span>}
      </div>
      {objectives && <div className="mb-2"><span className="font-semibold">Objectifs:</span> {objectives}</div>}
      {outcomes && <div className="mb-2"><span className="font-semibold">Résultats:</span> {outcomes}</div>}
      {links && Array.isArray(links) && links.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Liens:</span>
          <ul className="list-disc ml-5">
            {links.map((link: string, i: number) => (
              <li key={i}><a href={link} className="text-[var(--color-primary)] underline" target="_blank" rel="noopener noreferrer">{link}</a></li>
            ))}
          </ul>
        </div>
      )}
      <Button variant="primary" className="mt-2">Consulter le dossier complet</Button>
    </div>
  );
}