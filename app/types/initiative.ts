export interface Initiative {
  id: string;
  title: string;
  description?: string;
  category?: string;
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
  jurisdiction_id: number;
}

export interface Jurisdiction {
  id: number;
  name: string;
  country_code: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  osm_id: number;
  osm_type: string;
  type: 'city' | 'region' | 'country';
  created_at?: string;
  updated_at?: string;
}

export interface InitiativeRequest {
  id: string;
  initiative_id: string;
  jurisdiction_id: number;
  user_id: string;
  comment?: string;
  created_at?: string;
  // Relations
  jurisdiction?: Jurisdiction;
  initiative?: Initiative;
} 