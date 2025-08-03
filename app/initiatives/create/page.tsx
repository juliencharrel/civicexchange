import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";

const supabase = createClient();

const initialState = {
  title: "",
  description: "",
  category: "",
  status: "planned",
  jurisdiction: "",
  jurisdiction_type: "city",
  country: "",
  organizing_body: "",
  start_date: "",
  end_date: "",
  objectives: "",
  outcomes: "",
  links: "",
};

export default function CreateInitiativePage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Convert links to JSON if provided
    let links = null;
    try {
      links = form.links ? JSON.parse(form.links) : null;
    } catch {
      setError("Links must be valid JSON.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("initiatives").insert([
      {
        ...form,
        links,
        // user field is set automatically in backend (trigger or RLS)
      },
    ]);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm(initialState);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Créer une initiative</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} required placeholder="Titre" className="w-full p-2 border rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Catégorie" className="w-full p-2 border rounded" />
        <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="planned">Planifiée</option>
          <option value="ongoing">En cours</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
        <input name="jurisdiction" value={form.jurisdiction} onChange={handleChange} required placeholder="Juridiction" className="w-full p-2 border rounded" />
        <select name="jurisdiction_type" value={form.jurisdiction_type} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="city">Ville</option>
          <option value="municipality">Municipalité</option>
          <option value="department">Département</option>
          <option value="region">Région</option>
          <option value="other">Autre</option>
        </select>
        <input name="country" value={form.country} onChange={handleChange} placeholder="Pays" className="w-full p-2 border rounded" />
        <input name="organizing_body" value={form.organizing_body} onChange={handleChange} placeholder="Organisme porteur" className="w-full p-2 border rounded" />
        <input name="start_date" value={form.start_date} onChange={handleChange} type="date" placeholder="Date de début" className="w-full p-2 border rounded" />
        <input name="end_date" value={form.end_date} onChange={handleChange} type="date" placeholder="Date de fin" className="w-full p-2 border rounded" />
        <textarea name="objectives" value={form.objectives} onChange={handleChange} placeholder="Objectifs" className="w-full p-2 border rounded" />
        <textarea name="outcomes" value={form.outcomes} onChange={handleChange} placeholder="Résultats" className="w-full p-2 border rounded" />
        <textarea name="links" value={form.links} onChange={handleChange} placeholder='Liens (JSON, ex: ["https://..."])' className="w-full p-2 border rounded" />
        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-light)] disabled:opacity-50">
          {loading ? "Création..." : "Créer l'initiative"}
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Initiative créée !</div>}
      </form>
    </div>
  );
}