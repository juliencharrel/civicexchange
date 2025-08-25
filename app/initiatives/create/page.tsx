"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "../../../lib/supabase/client";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../components/ui/form";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn, upsertJurisdiction } from "../../../lib/utils";
import JurisdictionAutocomplete from "../../components/forms/JurisdictionAutocomplete";
import { CategoryButtons } from "../../components/forms/category-buttons";
import type { Jurisdiction } from "../../types/database";

const supabase = createClient();

const initiativeSchema = z.object({
  title: z.string().min(2, { message: "Le titre est requis." }),
  description: z.string().optional(),
  category_id: z.string().optional(),
  status: z.enum(["planned", "ongoing", "completed", "cancelled"]),
  organizing_body: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  objectives: z.string().optional(),
  outcomes: z.string().optional(),
  links: z.string().optional(),
  details: z.string().optional(),
  tags: z.string().optional(), // On va traiter ça comme une string séparée par des virgules
  // Champs de juridiction
  jurisdiction_name: z.string().min(1, { message: "La juridiction est requise." }),
  jurisdiction_country_code: z.string().optional(),
  jurisdiction_country: z.string().optional(),
  jurisdiction_region: z.string().optional(),
  jurisdiction_latitude: z.number(),
  jurisdiction_longitude: z.number(),
  jurisdiction_osm_id: z.number(),
  jurisdiction_osm_type: z.string(),
  jurisdiction_type: z.enum(["city", "region", "country", "municipality", "department", "other"]),
});

export default function CreateInitiativePage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'> | null>(null);

  const form = useForm<z.infer<typeof initiativeSchema>>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      status: "planned",
      organizing_body: "",
      start_date: undefined,
      end_date: undefined,
      objectives: "",
      outcomes: "",
      links: "",
      details: "",
      tags: "",
      // Champs de juridiction
      jurisdiction_name: "",
      jurisdiction_country_code: "",
      jurisdiction_country: "",
      jurisdiction_region: "",
      jurisdiction_latitude: 0,
      jurisdiction_longitude: 0,
      jurisdiction_osm_id: 0,
      jurisdiction_osm_type: "",
      jurisdiction_type: "city" as const,
    },
  });

  async function onSubmit(values: z.infer<typeof initiativeSchema>) {
    setError(null);
    setSuccess(false);
    
    try {
      // 1. Créer ou trouver la juridiction
      const { id: jurisdictionId } = await upsertJurisdiction(supabase, {
        name: values.jurisdiction_name,
        country_code: values.jurisdiction_country_code,
        country: values.jurisdiction_country,
        region: values.jurisdiction_region,
        latitude: values.jurisdiction_latitude,
        longitude: values.jurisdiction_longitude,
        osm_id: values.jurisdiction_osm_id,
        osm_type: values.jurisdiction_osm_type,
        type: values.jurisdiction_type as 'city' | 'region' | 'country',
      });

      // 2. Traiter les liens et tags
      let links = null;
      if (values.links) {
        try {
          links = JSON.parse(values.links);
        } catch {
          throw new Error("Les liens doivent être au format JSON valide.");
        }
      }

      const tags = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null;

      // 3. Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour créer une initiative.");
      }

      // 4. Créer l'initiative
      const { start_date, end_date } = values;
      const { error: initiativeError } = await supabase.from("initiatives").insert([
        {
          title: values.title,
          description: values.description || null,
          category_id: values.category_id || null,
          status: values.status,
          organizing_body: values.organizing_body || null,
          start_date: start_date ? start_date.toISOString().slice(0, 10) : null,
          end_date: end_date ? end_date.toISOString().slice(0, 10) : null,
          objectives: values.objectives || null,
          outcomes: values.outcomes || null,
          details: values.details || null,
          links,
          tags,
          user_id: user.id,
          jurisdiction_id: jurisdictionId,
        },
      ]);

      if (initiativeError) {
        throw new Error(`Erreur lors de la création de l'initiative: ${initiativeError.message}`);
      }

      setSuccess(true);
      form.reset();
      setSelectedJurisdiction(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite.");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Créer une initiative</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input placeholder="Titre de l'initiative" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CategoryButtons
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Sélectionner une catégorie..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planned">Planifiée</SelectItem>
                    <SelectItem value="ongoing">En cours</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jurisdiction_name"
            render={() => (
              <FormItem>
                <FormLabel>Juridiction</FormLabel>
                <FormControl>
                  <JurisdictionAutocomplete
                    onSelect={(jurisdiction) => {
                      setSelectedJurisdiction(jurisdiction);
                      form.setValue("jurisdiction_name", jurisdiction.name);
                      form.setValue("jurisdiction_country_code", jurisdiction.country_code);
                      form.setValue("jurisdiction_country", jurisdiction.country);
                      form.setValue("jurisdiction_region", jurisdiction.region || '');
                      form.setValue("jurisdiction_latitude", jurisdiction.latitude);
                      form.setValue("jurisdiction_longitude", jurisdiction.longitude);
                      form.setValue("jurisdiction_osm_id", jurisdiction.osm_id);
                      form.setValue("jurisdiction_osm_type", jurisdiction.osm_type);
                      form.setValue("jurisdiction_type", jurisdiction.type);
                    }}
                    value=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizing_body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organisme porteur</FormLabel>
                <FormControl>
                  <Input placeholder="Organisme porteur" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Choisir une date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Choisir une date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objectifs</FormLabel>
                <FormControl>
                  <Textarea placeholder="Objectifs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="outcomes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Résultats</FormLabel>
                <FormControl>
                  <Textarea placeholder="Résultats" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Détails supplémentaires</FormLabel>
                <FormControl>
                  <Textarea placeholder="Informations détaillées sur l'initiative..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (séparés par des virgules)</FormLabel>
                <FormControl>
                  <Input placeholder="environnement, innovation, social..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="links"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liens (JSON, ex: [&quot;https://...&quot;])</FormLabel>
                <FormControl>
                  <Textarea placeholder='[&quot;https://...&quot;]' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Création..." : "Créer l'initiative"}
          </Button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Initiative créée !</div>}
      </form>
      </Form>
    </div>
  );
}