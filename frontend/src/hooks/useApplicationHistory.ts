import { useState, useEffect, useMemo } from "react";
import { ListApplications } from "../services/AplicationServices";
import type { ApplicationItem } from "../model/aplicationModel";

interface Filtros {
    busqueda: string;
    tipo: string;
    estado: string;
}

const ITEMS_POR_PAGINA = 5; // 👈 Cambiado a 5 solicitudes por página

export const useApplicationHistory = () => {
    // Estado para TODAS las solicitudes (sin filtrar)
    const [todasLasSolicitudes, setTodasLasSolicitudes] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filtros
    const [filtros, setFiltros] = useState<Filtros>({
        busqueda: "",
        tipo: "",
        estado: ""
    });
    
    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    
    // Modal
    const [vistaDetalle, setVistaDetalle] = useState<ApplicationItem | null>(null);

    // Cargar TODAS las solicitudes solo una vez al montar el componente
    useEffect(() => {
        const cargarTodasLasSolicitudes = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // 🔧 OPCIÓN 1: Si tu backend devuelve TODAS las solicitudes en una sola llamada
                const { applications } = await ListApplications(1);
                setTodasLasSolicitudes(applications);

                // 🔧 OPCIÓN 2: Si tu backend pagina y necesitas obtener TODAS las páginas
                // Descomenta esto si necesitas cargar múltiples páginas del backend:
                /*
                let todasLasSolicitudesTemp: ApplicationItem[] = [];
                let paginaBackend = 1;
                let hayMasPaginas = true;
                
                while (hayMasPaginas) {
                    const { applications, totalPages } = await ListApplications(paginaBackend);
                    todasLasSolicitudesTemp = [...todasLasSolicitudesTemp, ...applications];
                    
                    if (paginaBackend >= totalPages) {
                        hayMasPaginas = false;
                    } else {
                        paginaBackend++;
                    }
                }
                
                setTodasLasSolicitudes(todasLasSolicitudesTemp);
                */
                
            } catch (err: any) {
                setError(err.response?.data?.message || "Error al cargar solicitudes");
                setTodasLasSolicitudes([]); // Asegurar que esté vacío en caso de error
            } finally {
                setLoading(false);
            }
        };

        cargarTodasLasSolicitudes();
    }, []);

    // Obtener tipos únicos para el filtro
    const tiposUnicos = useMemo(() => {
        const tipos = todasLasSolicitudes.map(s => s.nombreSolicitud);
        return Array.from(new Set(tipos)).sort();
    }, [todasLasSolicitudes]);

    // Obtener estados únicos para el filtro
    const estadosUnicos = useMemo(() => {
        const estados = todasLasSolicitudes.map(s => s.estado);
        return Array.from(new Set(estados)).sort();
    }, [todasLasSolicitudes]);

    // FILTRADO EN FRONTEND
    const solicitudesFiltradas = useMemo(() => {
        let resultado = [...todasLasSolicitudes];

        // Filtro por búsqueda (expediente, encargado o participante)
        if (filtros.busqueda.trim()) {
            const busquedaLower = filtros.busqueda.toLowerCase().trim();
            
            resultado = resultado.filter(solicitud => {
                // Buscar en expediente
                const coincideExpediente = solicitud.expediente
                    .toLowerCase()
                    .includes(busquedaLower);
                
                // Buscar en encargado
                const coincideEncargado = solicitud.encargado
                    .toLowerCase()
                    .includes(busquedaLower);
                
                // Buscar en participantes
                const coincideParticipante = solicitud.participantes?.some(p => 
                    p.nombre.toLowerCase().includes(busquedaLower)
                ) || false;

                return coincideExpediente || coincideEncargado || coincideParticipante;
            });
        }

        // Filtro por tipo de solicitud
        if (filtros.tipo) {
            resultado = resultado.filter(s => s.nombreSolicitud === filtros.tipo);
        }

        // Filtro por estado
        if (filtros.estado) {
            resultado = resultado.filter(s => s.estado === filtros.estado);
        }

        return resultado;
    }, [todasLasSolicitudes, filtros]);

    // PAGINACIÓN EN FRONTEND (ahora con 5 elementos por página)
    const solicitudesPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        const fin = inicio + ITEMS_POR_PAGINA;
        return solicitudesFiltradas.slice(inicio, fin);
    }, [solicitudesFiltradas, paginaActual]);

    // Calcular totales
    const totalRegistros = solicitudesFiltradas.length;
    const totalPaginas = Math.ceil(totalRegistros / ITEMS_POR_PAGINA);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setPaginaActual(1);
    }, [filtros.busqueda, filtros.tipo, filtros.estado]);

    // Validar que la página actual no exceda el total de páginas
    useEffect(() => {
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            setPaginaActual(totalPaginas);
        }
    }, [totalPaginas, paginaActual]);

    // Función para actualizar filtros
    const actualizarFiltros = (nuevosFiltros: Partial<Filtros>) => {
        setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    };

    // Limpiar todos los filtros
    const limpiarFiltros = () => {
        setFiltros({ busqueda: "", tipo: "", estado: "" });
    };

    // Cambiar de página con validación
    const cambiarPagina = (nuevaPagina: number) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
            // Scroll suave al inicio de la página
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return {
        // Solicitudes paginadas (5 por página)
        solicitudes: solicitudesPaginadas,
        loading,
        error,
        filtros,
        setFiltros: actualizarFiltros,
        paginaActual,
        totalPaginas,
        totalRegistros,
        vistaDetalle,
        setVistaDetalle,
        limpiarFiltros,
        tiposUnicos,
        estadosUnicos,
        cambiarPagina
    };
};