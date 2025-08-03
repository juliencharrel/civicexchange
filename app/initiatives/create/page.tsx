"use client";
import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { Field, Label, Input, Textarea, Select } from "@headlessui/react";

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
        <Field>
          <Label htmlFor="title">Titre</Label>
          <Input id="title" name="title" value={form.title} onChange={handleChange} required className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="category">Catégorie</Label>
          <Input id="category" name="category" value={form.category} onChange={handleChange} className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="status">Statut</Label>
          <Select id="status" name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="planned">Planifiée</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
          </Select>
        </Field>
        <Field>
          <Label htmlFor="jurisdiction">Juridiction</Label>
          <Input id="jurisdiction" name="jurisdiction" value={form.jurisdiction} onChange={handleChange} required className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="jurisdiction_type">Type de juridiction</Label>
          <Select id="jurisdiction_type" name="jurisdiction_type" value={form.jurisdiction_type} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="city">Ville</option>
            <option value="municipality">Municipalité</option>
            <option value="department">Département</option>
            <option value="region">Région</option>
            <option value="other">Autre</option>
          </Select>
        </Field>
        <Field>
          <Label htmlFor="country">Pays</Label>
          <Input id="country" name="country" value={form.country} onChange={handleChange} className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="organizing_body">Organisme porteur</Label>
          <Input id="organizing_body" name="organizing_body" value={form.organizing_body} onChange={handleChange} className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="start_date">Date de début</Label>
          <Input id="start_date" name="start_date" value={form.start_date} onChange={handleChange} type="date" className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="end_date">Date de fin</Label>
          <Input id="end_date" name="end_date" value={form.end_date} onChange={handleChange} type="date" className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="objectives">Objectifs</Label>
          <Textarea id="objectives" name="objectives" value={form.objectives} onChange={handleChange} className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="outcomes">Résultats</Label>
          <Textarea id="outcomes" name="outcomes" value={form.outcomes} onChange={handleChange} className="w-full p-2 border rounded" />
        </Field>
        <Field>
          <Label htmlFor="links">Liens (JSON, ex: [&quot;https://...&quot;])</Label>
          <Textarea id="links" name="links" value={form.links} onChange={handleChange} className="w-full p-2 border rounded" />
        </Field>
        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-light)] disabled:opacity-50">
          {loading ? "Création..." : "Créer l'initiative"}
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Initiative créée !</div>}
      </form>
    </div>
  );
}