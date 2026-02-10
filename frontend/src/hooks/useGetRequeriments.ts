import { useState } from "react";
import { RequirementsService } from "../services/RequirementsService.ts";
import type { Requirement } from "../model/requerimentsModel.ts";

export const useGetRequirements = () => {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequirements = async (applicationTypeId: number, condition: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await RequirementsService(applicationTypeId, condition);
            console.log(response.data);
            if (response.status) {
                setRequirements(response.data);
            } else {
                setError(response.message);
            }
        } catch (err:any) {
            setError(err instanceof Error ? err.message : "Error al obtener requisitos");
            console.log(err.response);
        } finally {
            setLoading(false);
        }
    };

    return {
        requirements,
        loading,
        error,
        fetchRequirements
    };
};
