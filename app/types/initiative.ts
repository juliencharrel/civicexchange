export interface Initiative {
  id: string;
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
  links?: unknown;
  created_at?: string;
  votes_count?: number;
} 