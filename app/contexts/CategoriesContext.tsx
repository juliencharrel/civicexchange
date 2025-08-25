"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Category {
  id: string;
  name: string;
  keywords: string[];
  icon: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('initiative_categories')
          .select('*')
          .order('name');

        if (fetchError) {
          throw fetchError;
        }

        setCategories(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };

  const getCategoryByName = (name: string): Category | undefined => {
    return categories.find(cat => cat.name === name);
  };

  return (
    <CategoriesContext.Provider value={{
      categories,
      loading,
      error,
      getCategoryById,
      getCategoryByName
    }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
