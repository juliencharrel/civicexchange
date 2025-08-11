import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { MapPin, Users } from "lucide-react";

interface RequestCount {
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_country: string;
  jurisdiction_region?: string;
  jurisdiction_type: string;
  request_count: number;
}

interface InitiativeRequestsDisplayProps {
  requestCounts: RequestCount[];
}

export default function InitiativeRequestsDisplay({ requestCounts }: InitiativeRequestsDisplayProps) {
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
            <TableHead className="text-right">Demandes</TableHead>
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
              <TableCell className="text-right">
                <Badge variant="secondary">
                  {count.request_count} demande{count.request_count > 1 ? 's' : ''}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
