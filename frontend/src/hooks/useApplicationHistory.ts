import { useState, useEffect, useMemo } from "react";
import { ListApplications } from "../services/AplicationServices";
import type { ApplicationItem } from "../model/aplicationModel";

interface Filtros {
    busqueda: string;
    tipo: string;
    estado: string;
}

const ITEMS_POR_PAGINA = 5;

export const useApplicationHistory = () => {
    const [todasLasSolicitudes, setTodasLasSolicitudes] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<Filtros>({ busqueda: "", tipo: "", estado: "" });
    const [paginaActual, setPaginaActual] = useState(1);
    const [vistaDetalle, setVistaDetalle] = useState<ApplicationItem | null>(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const { applications } = await ListApplications(1);
                setTodasLasSolicitudes(applications || []);
            } catch (err: any) {
                setError("Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const solicitudesFiltradas = useMemo(() => {
        let result = [...todasLasSolicitudes];
        if (filtros.busqueda.trim()) {
            const b = filtros.busqueda.toLowerCase().trim();
            result = result.filter(s => 
                (s.expediente?.toLowerCase().includes(b)) || 
                (s.participantes?.some(p => p.numero_identificacion?.toLowerCase().includes(b)))
            );
        }
        if (filtros.tipo) result = result.filter(s => s.nombreSolicitud === filtros.tipo);
        if (filtros.estado) result = result.filter(s => s.estado === filtros.estado);
        return result;
    }, [todasLasSolicitudes, filtros]);

    const solicitudesPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        return solicitudesFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA);
    }, [solicitudesFiltradas, paginaActual]);

    const totalPaginas = Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA);

    return {
        solicitudes: solicitudesPaginadas,
        loading,
        error,
        filtros,
        setFiltros: (f: Partial<Filtros>) => setFiltros(prev => ({ ...prev, ...f })),
        paginaActual,
        totalPaginas,
        totalRegistros: solicitudesFiltradas.length,
        vistaDetalle,
        setVistaDetalle,
        limpiarFiltros: () => setFiltros({ busqueda: "", tipo: "", estado: "" }),
        tiposUnicos: Array.from(new Set(todasLasSolicitudes.map(s => s.nombreSolicitud))).sort(),
        estadosUnicos: Array.from(new Set(todasLasSolicitudes.map(s => s.estado))).sort(),
        cambiarPagina: (p: number) => setPaginaActual(p)
    };
};