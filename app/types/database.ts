// Types pour la base de données Supabase

export interface InitiativeCategory {
  id: string;
  name: string;
  keywords: string[];
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  country_code: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  osm_id: number;
  osm_type: string;
  type: 'city' | 'municipality' | 'department' | 'region' | 'country' | 'other';
  created_at?: string;
  updated_at?: string;
}

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  category_name?: string; // Ancien champ pour compatibilité
  category_id?: string; // Nouveau champ pour la relation
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  organizing_body?: string;
  start_date?: string;
  end_date?: string;
  objectives?: string;
  outcomes?: string;
  links?: string[] | unknown;
  created_at?: string;
  updated_at?: string;
  votes_count?: number;
  user_id: string;
  details?: string;
  tags?: string[];
  jurisdiction_id: string;
  // Relations
  jurisdiction?: Jurisdiction;
  category?: InitiativeCategory;
}

export interface InitiativeRequest {
  id: string;
  initiative_id: string;
  jurisdiction_id?: string;
  user_id: string;
  comment?: string;
  created_at?: string;
  // Relations
  jurisdiction?: Jurisdiction;
  initiative?: Initiative;
}

export interface InitiativeVote {
  id: string;
  initiative_id: string;
  user_id: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
}
