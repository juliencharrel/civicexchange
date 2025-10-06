"use client";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MapPin, Building2 } from "lucide-react";
import type { Initiative } from "../../types/database";
import { CategoryBadge } from "../ui/category-badge";


interface InitiativeCardProps {
  initiative: Initiative;
  requestCount?: number;
  variant?: "default" | "map";
  className?: string;
}

export default function InitiativeCard({
  initiative,
  requestCount = 0,
  variant = "default",
  className = ""
}: InitiativeCardProps) {
  


  const handleCardClick = () => {
    // Dispatch event to show initiative details and move map
    window.dispatchEvent(new CustomEvent('showInitiativeDetails', {
      detail: {
        initiative: initiative,
        lat: initiative.jurisdiction?.latitude,
        lng: initiative.jurisdiction?.longitude
      }
    }));
  };



  // Variant map pour la sidebar
  if (variant === "map") {
    return (
      <Card 
        className={`cursor-pointer transition-all ${className}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold line-clamp-2 mb-2">
            {initiative.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {initiative.category_id && (
              <CategoryBadge categoryId={initiative.category_id} size="sm" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {initiative.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {initiative.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            {initiative.jurisdiction && (
              <div className="flex items-center gap-1">
                <span className="truncate">{initiative.jurisdiction.name}</span>
              </div>
            )}
          </div>
          
        </CardContent>
      </Card>
    );
  }

  // Variant default (pour la home page) - amélioré avec plus de détails
  return (
    <Card 
      className={`cursor-pointer transition-all flex flex-col h-full ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold line-clamp-2 mb-2">
          {initiative.title}
        </CardTitle>
        
        <div className="flex items-center gap-2 flex-wrap">
          {initiative.category_id && (
            <CategoryBadge categoryId={initiative.category_id} size="default" />
          )}
          {initiative.category_name && !initiative.category_id && (
            <Badge variant="outline" className="text-xs">
              {initiative.category_name}
            </Badge>
          )}
        </div>
        
        {initiative.description && (
          <p className="text-gray-600 line-clamp-2 text-sm">
            {initiative.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Informations de localisation et organisation */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {initiative.jurisdiction && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{initiative.jurisdiction.name}</span>
              {initiative.jurisdiction.country && (
                <span>({initiative.jurisdiction.country})</span>
              )}
            </div>
          )}
          
          {initiative.organizing_body && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>{initiative.organizing_body}</span>
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
