'use client';
import InitiativeCard from '@/components/shared/InitiativeCard';
import type { Initiative } from '@/types/database';

interface ClientInitiativesWrapperProps {
  initiatives: Initiative[];
}

export default function ClientInitiativesWrapper({ initiatives }: ClientInitiativesWrapperProps) {
  return (
    <div className="space-y-4">
      {initiatives.map((initiative: Initiative) => (
        <InitiativeCard
          key={initiative.id}
          initiative={initiative}
          variant="default"
          className="mb-0"
        />
      ))}
    </div>
  );
} 