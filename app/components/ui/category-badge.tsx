import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCategories, Category } from "@/contexts/CategoriesContext";
import { Layers, HeartHandshake, BookOpen, ShieldCheck, House, CarFront, Trees, Paintbrush, UserCheck, Building2 as Building3D, MapPin as MapPin3D } from "lucide-react";

interface CategoryBadgeProps {
  categoryId?: string;
  categoryName?: string;
  category?: Category;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

// Function to get 3D icon for category (same as sidebar)
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('economy') || name.includes('économie')) return Building3D;
  if (name.includes('health') || name.includes('santé')) return HeartHandshake;
  if (name.includes('education') || name.includes('éducation')) return BookOpen;
  if (name.includes('safety') || name.includes('sécurité')) return ShieldCheck;
  if (name.includes('housing') || name.includes('logement')) return House;
  if (name.includes('mobility') || name.includes('mobilité')) return CarFront;
  if (name.includes('environment') || name.includes('environnement')) return Trees;
  if (name.includes('culture')) return Paintbrush;
  if (name.includes('civic') || name.includes('civique')) return UserCheck;
  if (name.includes('community') || name.includes('communauté')) return Building3D;
  if (name.includes('urban') || name.includes('design')) return MapPin3D;
  return Building3D; // Default icon
};

export function CategoryBadge({ 
  categoryId,
  categoryName,
  category: directCategory,
  variant = "default", 
  size = "default",
  className 
}: CategoryBadgeProps) {
  const { getCategoryById, getCategoryByName } = useCategories();
  
  // Déterminer la catégorie à utiliser
  let category: Category | undefined;
  
  if (directCategory) {
    category = directCategory;
  } else if (categoryId) {
    category = getCategoryById(categoryId);
  } else if (categoryName) {
    category = getCategoryByName(categoryName);
  }
  
  // Si aucune catégorie trouvée, ne rien afficher
  if (!category) {
    return null;
  }
  
  const IconComponent = getCategoryIcon(category.name);
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "lg" && "text-sm px-3 py-1",
        className
      )}
    >
      <IconComponent className="h-3 w-3" />
      <span>{category.name}</span>
    </Badge>
  );
}


