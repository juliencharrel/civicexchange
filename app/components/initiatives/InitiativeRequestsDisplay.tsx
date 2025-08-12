import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MapPin, Users, Trash2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface RequestCount {
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_country: string;
  jurisdiction_region?: string;
  jurisdiction_type: string;
  request_count: number;
  requests: Array<{
    id: string;
    user_id: string;
    user_display_name: string;
    comment?: string;
    created_at: string;
  }>;
}

interface InitiativeRequestsDisplayProps {
  requestCounts: RequestCount[];
  currentUser: User | null;
  onDeleteRequest: (requestId: string) => void;
  onShowDetails: (count: RequestCount) => void;
  onAddRequest: (jurisdictionId: string, jurisdictionName: string) => void;
}

export default function InitiativeRequestsDisplay({ 
  requestCounts, 
  currentUser, 
  onDeleteRequest,
  onShowDetails,
  onAddRequest
}: InitiativeRequestsDisplayProps) {
  if (requestCounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Aucune demande d&apos;utilisation dans d&apos;autres juridictions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Juridiction</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Demandes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requestCounts.map((count) => (
            <TableRow key={count.jurisdiction_id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{count.jurisdiction_name}</div>
                    <div className="text-sm text-gray-500">
                      {count.jurisdiction_country}
                      {count.jurisdiction_region && ` • ${count.jurisdiction_region}`}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {count.jurisdiction_type}
                </Badge>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => onShowDetails(count)}
                  className="text-left hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <Badge variant="secondary">
                    {count.request_count} demande{count.request_count > 1 ? 's' : ''}
                  </Badge>
                </button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {currentUser && count.requests.some(req => req.user_id === currentUser.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const userRequest = count.requests.find(req => req.user_id === currentUser.id);
                        if (userRequest) {
                          onDeleteRequest(userRequest.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : currentUser ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddRequest(count.jurisdiction_id, count.jurisdiction_name)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Ajouter ma demande
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
