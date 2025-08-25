"use client";
import { useState } from 'react';
import { useCategories } from '@/contexts/CategoriesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectorFieldProps {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

// Composant avec label intégré
export function CategorySelectorField({
  label,
  value,
  onValueChange,
  placeholder = "Sélectionner une catégorie...",
  disabled = false,
  className,
  required = false
}: CategorySelectorFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { categories, loading, getCategoryById } = useCategories();

  const selectedCategory = value ? getCategoryById(value) : null;

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.keywords?.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className={cn("flex items-center gap-2", className)}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">Chargement des catégories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedCategory && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedCategory.icon}</span>
                <span>{selectedCategory.name}</span>
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Aucune catégorie trouvée
              </div>
            ) : (
              filteredCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 px-4 py-2 h-auto",
                    value === category.id && "bg-accent"
                  )}
                  onClick={() => {
                    onValueChange(category.id);
                    setOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span className="text-sm">{category.icon}</span>
                  <span className="flex-1 text-left">{category.name}</span>
                  {value === category.id && (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
