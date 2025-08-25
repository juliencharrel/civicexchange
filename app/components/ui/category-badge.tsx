import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCategories, Category } from "@/contexts/CategoriesContext";

interface CategoryBadgeProps {
  categoryId?: string;
  categoryName?: string;
  category?: Category;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const categoryColors: Record<string, string> = {
  "Mobility / Transport": "bg-blue-100 text-blue-800 border-blue-200",
  "Environment / Ecology": "bg-green-100 text-green-800 border-green-200",
  "Culture / Arts": "bg-purple-100 text-purple-800 border-purple-200",
  "Social / Solidarity": "bg-pink-100 text-pink-800 border-pink-200",
  "Education / Youth": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Health / Well-being": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Urban Planning / Development": "bg-orange-100 text-orange-800 border-orange-200",
  "Economy / Entrepreneurship": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Innovation / Tech": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Governance / Civic": "bg-slate-100 text-slate-800 border-slate-200",
  "Safety / Security": "bg-red-100 text-red-800 border-red-200",
  "Leisure / Sports": "bg-lime-100 text-lime-800 border-lime-200",
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
  
  const colorClass = categoryColors[category.name] || "bg-gray-100 text-gray-800 border-gray-200";
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        "inline-flex items-center gap-1.5 border",
        colorClass,
        size === "sm" && "text-xs px-2 py-0.5",
        size === "lg" && "text-sm px-3 py-1",
        className
      )}
    >
      <span className="text-sm">{category.icon}</span>
      <span>{category.name}</span>
    </Badge>
  );
}


