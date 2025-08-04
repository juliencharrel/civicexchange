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
import { cn } from "../../../lib/utils";

const supabase = createClient();

const initiativeSchema = z.object({
  title: z.string().min(2, { message: "Le titre est requis." }),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["planned", "ongoing", "completed", "cancelled"]),
  jurisdiction: z.string().min(1, { message: "La juridiction est requise." }),
  jurisdiction_type: z.enum(["city", "municipality", "department", "region", "other"]),
  country: z.string().optional(),
  organizing_body: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  objectives: z.string().optional(),
  outcomes: z.string().optional(),
  links: z.string().optional(),
});

export default function CreateInitiativePage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof initiativeSchema>>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "planned",
      jurisdiction: "",
      jurisdiction_type: "city",
      country: "",
      organizing_body: "",
      start_date: undefined,
      end_date: undefined,
      objectives: "",
      outcomes: "",
      links: "",
    },
  });

  async function onSubmit(values: z.infer<typeof initiativeSchema>) {
    setError(null);
    setSuccess(false);
    let links = null;
    try {
      links = values.links ? JSON.parse(values.links) : null;
    } catch {
      setError("Links must be valid JSON.");
      return;
    }
    const { start_date, end_date, ...rest } = values;
    const { error } = await supabase.from("initiatives").insert([
      {
        ...rest,
        start_date: start_date ? start_date.toISOString().slice(0, 10) : null,
        end_date: end_date ? end_date.toISOString().slice(0, 10) : null,
        links,
      },
    ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      form.reset();
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <FormControl>
                  <Input placeholder="Catégorie" {...field} />
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
            name="jurisdiction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Juridiction</FormLabel>
                <FormControl>
                  <Input placeholder="Juridiction" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jurisdiction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de juridiction</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="city">Ville</SelectItem>
                    <SelectItem value="municipality">Municipalité</SelectItem>
                    <SelectItem value="department">Département</SelectItem>
                    <SelectItem value="region">Région</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <FormControl>
                  <Input placeholder="Pays" {...field} />
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