import { useState, useEffect, useCallback } from "react";
import { getRecaudacionMensual } from "../services/RecaudacionService.ts";
import type { RecaudacionMes } from "../model/recaudacionModel.ts";

export const useRecaudacionMensual = (anio: string) => {
    const [allData, setAllData] = useState<Record<string, RecaudacionMes[]>>({});
    const [aniosDisponibles, setAniosDisponibles] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getRecaudacionMensual();
            setAllData(response.data);
            // Años disponibles ordenados descendente
            const years = Object.keys(response.data).sort((a, b) => Number(b) - Number(a));
            setAniosDisponibles(years);
        } catch (err: any) {
            setError(err.message || "Error al obtener la recaudación mensual");
            console.error("Error en useRecaudacionMensual:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtrar en cliente según el año seleccionado
    const data: RecaudacionMes[] = allData[anio] ?? [];

    return { data, aniosDisponibles, loading, error, refetch: fetchData };
};
