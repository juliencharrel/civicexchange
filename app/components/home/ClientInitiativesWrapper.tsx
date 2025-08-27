"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import InitiativeCard from "../shared/InitiativeCard";
import type { Initiative } from "../../types/database";

const supabase = createClient();

interface ClientInitiativesWrapperProps {
  initiatives: Initiative[];
  requestCountMap: Map<string, number>;
}

export default function ClientInitiativesWrapper({ 
  initiatives, 
  requestCountMap
}: ClientInitiativesWrapperProps) {
  return (
    <>
      {initiatives.map((initiative) => (
        <InitiativeCard
          key={initiative.id}
          initiative={initiative}
          requestCount={requestCountMap.get(initiative.id) || 0}
          variant="default"
        />
      ))}
    </>
  );
} 