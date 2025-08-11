"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "../../../lib/supabase/client";
import { upsertJurisdiction } from "../../../lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { MapPin, Plus, Loader2 } from "lucide-react";
import JurisdictionAutocomplete from "../forms/JurisdictionAutocomplete";
import type { Jurisdiction } from "../../types/initiative";

const supabase = createClient();

const requestSchema = z.object({
  jurisdiction_name: z.string().min(1, { message: "La juridiction est requise." }),
  jurisdiction_country_code: z.string().optional(),
  jurisdiction_country: z.string().optional(),
  jurisdiction_region: z.string().optional(),
  jurisdiction_latitude: z.number(),
  jurisdiction_longitude: z.number(),
  jurisdiction_osm_id: z.number(),
  jurisdiction_osm_type: z.string(),
  jurisdiction_type: z.enum(["city", "region", "country"]),
  comment: z.string().optional(),
});

interface CreateInitiativeRequestProps {
  initiativeId: string;
  initiativeTitle: string;
  currentJurisdiction: Jurisdiction;
  onRequestCreated?: () => void;
}

export default function CreateInitiativeRequest({ 
  initiativeId, 
  initiativeTitle, 
  currentJurisdiction,
  onRequestCreated 
}: CreateInitiativeRequestProps) {
  const [open, setOpen] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      jurisdiction_name: "",
      jurisdiction_country_code: "",
      jurisdiction_country: "",
      jurisdiction_region: "",
      jurisdiction_latitude: 0,
      jurisdiction_longitude: 0,
      jurisdiction_osm_id: 0,
      jurisdiction_osm_type: "",
      jurisdiction_type: "city",
      comment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof requestSchema>) {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      // Vérifier que l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour créer une demande.");
      }

      // Vérifier que la juridiction sélectionnée est différente de l'actuelle
      if (values.jurisdiction_osm_id === currentJurisdiction.osm_id && 
          values.jurisdiction_osm_type === currentJurisdiction.osm_type) {
        throw new Error("Vous ne pouvez pas demander l&apos;utilisation dans la même juridiction.");
      }

      // Créer ou trouver la juridiction
      const { id: jurisdictionId } = await upsertJurisdiction(supabase, {
        name: values.jurisdiction_name,
        country_code: values.jurisdiction_country_code,
        country: values.jurisdiction_country,
        region: values.jurisdiction_region,
        latitude: values.jurisdiction_latitude,
        longitude: values.jurisdiction_longitude,
        osm_id: values.jurisdiction_osm_id,
        osm_type: values.jurisdiction_osm_type,
        type: values.jurisdiction_type,
      });

      // Note: La contrainte unique empêchera automatiquement les doublons
      // Pas besoin de vérifier manuellement

      // Créer la demande
      const { error: requestError } = await supabase
        .from('initiative_requests')
        .insert([{
          initiative_id: initiativeId,
          jurisdiction_id: jurisdictionId,
          user_id: user.id,
          comment: values.comment || null,
        }])
        .select('id'); // Demander le retour de l'ID pour confirmer l'insertion

      if (requestError) {
        // Gérer spécifiquement l'erreur de contrainte unique
        if (requestError.code === '23505' && requestError.message.includes('unique_user_initiative_jurisdiction')) {
          throw new Error("Vous avez déjà fait une demande pour cette initiative dans cette juridiction.");
        }
        throw new Error(`Erreur lors de la création de la demande: ${requestError.message}`);
      }

      setSuccess(true);
      form.reset();
      setSelectedJurisdiction(null);
      
      // Fermer le dialog après un délai
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        onRequestCreated?.();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen && isSubmitting) return; // Empêcher la fermeture pendant la soumission
    
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
      setSuccess(false);
      form.reset();
      setSelectedJurisdiction(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Demander l&apos;utilisation ailleurs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demander l&apos;utilisation de l&apos;initiative</DialogTitle>
          <DialogDescription>
            Proposez l&apos;utilisation de &quot;{initiativeTitle}&quot; dans une autre juridiction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Affichage de la juridiction actuelle */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Juridiction actuelle
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">{currentJurisdiction.name}</div>
                <div className="text-sm text-gray-500">
                  {currentJurisdiction.country}
                  {currentJurisdiction.region && ` • ${currentJurisdiction.region}`}
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {currentJurisdiction.type}
              </Badge>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="jurisdiction_name"
                render={() => (
                  <FormItem>
                    <FormLabel>Nouvelle juridiction</FormLabel>
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
                        value={selectedJurisdiction?.name || ''}
                        placeholder="Sélectionnez une nouvelle juridiction..."
                      />
                    </FormControl>
                    <FormMessage />
                    {selectedJurisdiction && (
                      <div className="text-xs text-gray-600 mt-1">
                        Sélectionné : <span className="font-medium capitalize">{selectedJurisdiction.type}</span> • {selectedJurisdiction.country}
                        {selectedJurisdiction.region && ` • ${selectedJurisdiction.region}`}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaire (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Expliquez pourquoi cette initiative serait utile dans cette juridiction..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  Demande créée avec succès !
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedJurisdiction}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer la demande"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
