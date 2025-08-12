"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { MapPin, Calendar, User } from "lucide-react";

interface Request {
  id: string;
  user_id: string;
  user_display_name: string;
  comment?: string;
  created_at: string;
}

interface RequestCount {
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_country: string;
  jurisdiction_region?: string;
  jurisdiction_type: string;
  request_count: number;
  requests: Request[];
}

interface RequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestCount: RequestCount | null;
}

export default function RequestDetailsDialog({ 
  open, 
  onOpenChange, 
  requestCount 
}: RequestDetailsDialogProps) {
  if (!requestCount) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Demandes pour {requestCount.jurisdiction_name}
          </DialogTitle>
          <DialogDescription>
            {requestCount.jurisdiction_country}
            {requestCount.jurisdiction_region && ` • ${requestCount.jurisdiction_region}`}
            <Badge variant="outline" className="ml-2 capitalize">
              {requestCount.jurisdiction_type}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {requestCount.requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {request.user_display_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {request.created_at ? new Date(request.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Date inconnue'}
                </div>
              </div>
              
              {request.comment && (
                <div className="mt-2 text-sm text-gray-700 italic">
                  &quot;{request.comment}&quot;
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
