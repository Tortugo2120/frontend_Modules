import { useState, useEffect, useMemo, useCallback } from "react";
import { ListApplications } from "../services/AplicationServices";
import type { ApplicationItem, Pager } from "../model/aplicationModel";

interface Filtros {
    busqueda: string;
    tipo: string;
    estado: string;
}

export const useApplicationHistory = () => {
    const [solicitudes, setSolicitudes] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<Filtros>({
        busqueda: "",
        tipo: "",
        estado: ""
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const [pager, setPager] = useState<Pager | null>(null);
    const [vistaDetalle, setVistaDetalle] = useState<ApplicationItem | null>(null);

    // Cargar solicitudes con debounce para la búsqueda
    const cargarSolicitudes = useCallback(async (page: number, filtrosActuales: Filtros) => {
        try {
            setLoading(true);
            setError(null);
            
            const { applications, pager: pagerData } = await ListApplications(
                page,
                filtrosActuales.busqueda || undefined,
                filtrosActuales.tipo || undefined,
                filtrosActuales.estado || undefined
            );
            
            setSolicitudes(applications);
            setPager(pagerData);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar las solicitudes");
            console.error("Error al cargar solicitudes:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar solicitudes cuando cambian los filtros o la página
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            cargarSolicitudes(paginaActual, filtros);
        }, 300); // Debounce de 300ms para la búsqueda

        return () => clearTimeout(timeoutId);
    }, [filtros, paginaActual, cargarSolicitudes]);

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            busqueda: "",
            tipo: "",
            estado: ""
        });
        setPaginaActual(1);
    };

    // Obtener tipos únicos de las solicitudes actuales
    const tiposUnicos = useMemo(() => {
        const tipos = new Set(solicitudes.map(s => s.nombreSolicitud));
        return Array.from(tipos);
    }, [solicitudes]);

    // Cambiar página
    const cambiarPagina = (nuevaPagina: number) => {
        if (pager && nuevaPagina >= 1 && nuevaPagina <= pager.pageCount) {
            setPaginaActual(nuevaPagina);
        }
    };

    return {
        solicitudes,
        loading,
        error,
        filtros,
        setFiltros,
        paginaActual,
        setPaginaActual,
        totalPaginas: pager?.pageCount || 1,
        totalRegistros: pager?.total || 0,
        registrosPorPagina: pager?.perPage || 10,
        vistaDetalle,
        setVistaDetalle,
        limpiarFiltros,
        tiposUnicos,
        cambiarPagina,
        hasMore: pager?.hasMore || false
    };
};