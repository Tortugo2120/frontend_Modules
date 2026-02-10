import { useState, useCallback } from "react";
import { RequirementsService } from "../services/RequirementsService";
import type { Requirement } from "../model/requerimentsModel";

export const useGetRequirements = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirements = useCallback(
    async (applicationTypeId: number, condition: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await RequirementsService(applicationTypeId, condition);

        if (response.status) {
          setRequirements(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(
          err instanceof Error ? err.message : "Error al obtener requisitos"
        );
      } finally {
        setLoading(false);
      }
    },
    [] // 👈 no depende de nada externo
  );

  return {
    requirements,
    loading,
    error,
    fetchRequirements,
  };
};
