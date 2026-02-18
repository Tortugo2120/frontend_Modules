import { useEffect, useState } from 'react';
import { RequirementsByApplicationId } from '../services/RequirementsService';
import type { RequirementByApplication } from '../model/requerimentsModel';

export const useGetRequirementsByApplication = (applicationId: number | null) => {
    const [requirements, setRequirements] = useState<RequirementByApplication[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setRequirements([]);
            return;
        }

        const fetchRequirements = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await RequirementsByApplicationId(applicationId);
                console.log("Response status:", response.status);
                console.log("Response data:", response.data);
                if (response.status) {
                    const normalized = Array.isArray(response.data)
                        ? response.data.map(r => ({
                            ...r,
                            entregado: Number(r.entregado)
                          }))
                        : [];
                    setRequirements(normalized);
                } else {
                    setError(response.message || 'Error al obtener los requisitos');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al obtener los requisitos';
                console.error("Error fetching requirements:", errorMessage);
                setError(errorMessage);
                setRequirements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRequirements();
    }, [applicationId]);

    return { requirements, loading, error };
};