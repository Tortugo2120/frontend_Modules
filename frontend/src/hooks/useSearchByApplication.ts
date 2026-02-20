import { useState, useEffect, useRef, useCallback } from "react";
import { SearchApplication } from "../services/AplicationServices";
import type { ApplicationItem, ApplicationBackendItem } from "../model/aplicationModel";

const transformApplicationData = (backendData: ApplicationBackendItem): ApplicationItem => {
    return {
        id: parseInt(backendData.id),
        expediente: backendData.numero_expediente,
        nombreSolicitud: backendData.nombre_solicitud,
        descripcionSolicitud: backendData.descripcion_solicitud,
        precio: parseFloat(backendData.precio),
        estado: backendData.estado,
        fecha: backendData.fecha_inicio,
        fechaActualizacion: backendData.fecha_actualizacion,
        fechaFin: backendData.fecha_fin,
        encargado: backendData.encargado,
        participantes: backendData.participantes || [],
    };
};

export const useSearchByApplication = () => {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isActive, setIsActive] = useState<boolean>(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback(async (value: string) => {
        if (!value.trim() || value.trim().length < 2) {
            setResults([]);
            setIsActive(false);
            return;
        }

        setLoading(true);
        setError(null);
        setIsActive(true);

        try {
            // Detectar si es un número (DNI/CUI) o texto (expediente)
            const isNumeric = /^\d+$/.test(value.trim());
            const dni = isNumeric ? value.trim() : null;
            const applicationNumber = !isNumeric ? value.trim() : null;

            const response = await SearchApplication(dni, applicationNumber);

            if (response.status && response.data) {
                const transformed = response.data.map(transformApplicationData);
                setResults(transformed);
            } else {
                setResults([]);
            }
        } catch (err: unknown) {
            const e = err as { code?: string };
            if (e?.code !== "ERR_CANCELED") {
                setError("Error al buscar solicitudes.");
                setResults([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim() || query.trim().length < 2) {
            setResults([]);
            setIsActive(false);
            setLoading(false);
            return;
        }

        debounceRef.current = setTimeout(() => {
            search(query);
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, search]);

    const clearSearch = useCallback(() => {
        setQuery("");
        setResults([]);
        setIsActive(false);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        isActive,
        clearSearch,
    };
};
