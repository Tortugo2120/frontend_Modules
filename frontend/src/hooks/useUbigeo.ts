import { useState, useEffect } from "react";
import { searchUbigeo } from "../services/UbigeoService.ts";
import type { UbigeoItem } from "../model/ubigeoModel.ts";

export const useUbigeo = () => {
    const [ubigeos, setUbigeos] = useState<UbigeoItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUbigeos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await searchUbigeo();
                setUbigeos(response.data ?? []);
            } catch (err: any) {
                setError(err.message || "Error al obtener ubigeos");
                console.error("Error en useUbigeo:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUbigeos();
    }, []);

    return { ubigeos, loading, error };
};
