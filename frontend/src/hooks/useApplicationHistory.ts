import { useState, useEffect, useCallback } from "react";
import { ListApplications } from "../services/AplicationServices";
import type { ApplicationItem, Pager } from "../model/aplicationModel";

interface Filtros {
    busqueda: string;
    tipo: string;
    estado: string;
}

export const useApplicationHistory = () => {

    const [solicitudes, setSolicitudes] = useState<ApplicationItem[]>([]);
    const [pager, setPager] = useState<Pager | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const [filtros, setFiltros] = useState<Filtros>({ busqueda: "", tipo: "", estado: "" });
    const [paginaActual, setPaginaActual] = useState(1);
    const [vistaDetalle, setVistaDetalle] = useState<ApplicationItem | null>(null);



    //Función para cargar datos desde el Service.
    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { applications, pager: pagerData } = await ListApplications(paginaActual);

            setSolicitudes(applications || []);
            setPager(pagerData);
        } catch (err: any) {
            console.error("Error cargando aplicaciones:", err);
            setError("Error al conectar con el servidor o cargar los datos.");
        } finally {
            setLoading(false);
        }
    }, [paginaActual]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    /**
     * Lógica de filtrado:
     * Nota: Si tu backend no filtra, este filtro es "local" sobre los 10 registros actuales.
     * Si quieres filtrar en toda la base de datos, deberías pasar los filtros a ListApplications.
     */
    const solicitudesFiltradas = solicitudes.filter(s => {
        const cumpleBusqueda = !filtros.busqueda.trim() ||
            s.expediente?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            s.participantes?.some(p => p.numero_identificacion?.includes(filtros.busqueda));

        const cumpleTipo = !filtros.tipo || s.nombreSolicitud === filtros.tipo;
        const cumpleEstado = !filtros.estado || s.estado === filtros.estado;

        return cumpleBusqueda && cumpleTipo && cumpleEstado;
    });

    // 4. Handlers de interfaz
    const handleSetFiltros = (f: Partial<Filtros>) => {
        setFiltros(prev => ({ ...prev, ...f }));
        setPaginaActual(1); 
    };

    const limpiarFiltros = () => {
        setFiltros({ busqueda: "", tipo: "", estado: "" });
        setPaginaActual(1);
    };

    const cambiarPagina = (p: number) => {
        if (p > 0 && p <= (pager?.pageCount || 1)) {
            setPaginaActual(p);
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    };

    return {
        // Datos
        solicitudes: solicitudesFiltradas,
        loading,
        error,

        // Paginación 
        paginaActual,
        totalPaginas: pager?.pageCount || 1,
        totalRegistros: pager?.total || 0,
        cambiarPagina,

        // Filtros
        filtros,
        setFiltros: handleSetFiltros,
        limpiarFiltros,

        // Helpers para los selects de la UI
        tiposUnicos: Array.from(new Set(solicitudes.map(s => s.nombreSolicitud))).sort(),
        estadosUnicos: Array.from(new Set(solicitudes.map(s => s.estado))).sort(),

        // Detalle
        vistaDetalle,
        setVistaDetalle
    };
};