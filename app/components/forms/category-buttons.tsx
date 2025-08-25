"use client";
import { useState, useEffect } from 'react';
import { useCategories } from '@/contexts/CategoriesContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InitiativeCategory } from '@/types/database';

interface CategoryButtonsProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function CategoryButtons({
  value,
  onValueChange,
  disabled = false,
  className,
  required = false
}: CategoryButtonsProps) {
  const { categories, loading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<InitiativeCategory | null>(null);

  useEffect(() => {
    if (value && categories.length > 0) {
      const category = categories.find(cat => cat.id === value);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [value, categories]);

  const handleCategorySelect = (category: InitiativeCategory) => {
    if (selectedCategory?.id === category.id) {
      // Désélectionner si on clique sur la même catégorie
      setSelectedCategory(null);
      onValueChange('');
    } else {
      // Sélectionner la nouvelle catégorie
      setSelectedCategory(category);
      onValueChange(category.id);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium">
          Catégorie
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">Chargement des catégories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">
        Catégorie
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory?.id === category.id;
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto min-h-[80px] p-3 flex flex-col items-center gap-2 transition-all duration-200 relative",
                "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
                "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isSelected && "bg-blue-600 text-white border-blue-600 shadow-md",
                isSelected && "hover:bg-blue-700 hover:border-blue-700"
              )}
              onClick={() => handleCategorySelect(category)}
              disabled={disabled}
            >
              {/* Indicateur de sélection */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4" />
                </div>
              )}
              
              {/* Icône */}
              <span className={cn(
                "text-2xl",
                isSelected ? "text-white" : "text-gray-600"
              )}>
                {category.icon}
              </span>
              
              {/* Nom de la catégorie */}
              <span className={cn(
                "text-xs font-medium text-center leading-tight max-w-full",
                "break-words hyphens-auto whitespace-normal",
                isSelected ? "text-white" : "text-gray-700"
              )}>
                {category.name}
              </span>
            </Button>
          );
        })}
      </div>
      
      {/* Message d'aide */}
      <p className="text-xs text-gray-500 mt-2">
        Cliquez sur une catégorie pour la sélectionner. Cliquez à nouveau pour la désélectionner.
      </p>
    </div>
  );
}

// Composant avec label intégré pour compatibilité
export function CategoryButtonsField({
  value,
  onValueChange,
  disabled,
  className,
  required = false
}: CategoryButtonsProps & {
  label: string;
}) {
  return (
    <CategoryButtons
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className={className}
      required={required}
    />
  );
}
