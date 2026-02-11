import { useState, useEffect } from "react";
// Importamos el servicio y los tipos
import { ListApplications } from "../../services/AplicationServices"; 
import { type AplicationResponse } from "../../model/aplicationModel";

// Mapeo para convertir IDs numéricos del API a nombres legibles en la UI
const TIPO_SOLICITUD_MAP: Record<number, TipoSolicitud> = {
    1: 'Matrimonio',
    2: 'Divorcio',
    3: 'Nacimiento',
    4: 'Defunción',
    5: 'Copia de expediente'
};

type EstadoSolicitud = 'Pendiente' | 'Completado' | 'En Proceso' | 'Observado' | 'Cancelado';
type TipoSolicitud = 'Matrimonio' | 'Divorcio' | 'Nacimiento' | 'Defunción' | 'Copia de expediente';

interface Solicitud {
    id: number;
    expediente: string;
    tipo: TipoSolicitud;
    solicitante: string; // Nota: El API actual no parece devolver el nombre, lo pondremos opcional o genérico
    dni: string;
    estado: EstadoSolicitud;
    fecha: string;
    fechaActualizacion: string;
    monto?: number;
    observaciones?: string;
}

export default function History() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: '',
        estado: '',
        fechaInicio: '',
        fechaFin: ''
    });
    const [vistaDetalle, setVistaDetalle] = useState<Solicitud | null>(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 6;

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const dataRaw = await ListApplications();
                
                // Si el API devuelve un array de solicitudes en 'data'
                // Transformamos el modelo del API al modelo de tu UI
                const transformadas: Solicitud[] = (dataRaw as any).map((item: any) => ({
                    id: item.id,
                    expediente: item.numero_expediente,
                    tipo: TIPO_SOLICITUD_MAP[item.id_tipo_solicitud] || 'Copia de expediente',
                    solicitante: "Usuario #" + item.id_usuario, // Ajustar cuando el API traiga el nombre
                    dni: "---", // Ajustar cuando el API traiga el DNI
                    estado: item.estado as EstadoSolicitud,
                    fecha: new Date(item.fecha_inicio).toLocaleDateString(),
                    fechaActualizacion: new Date(item.fecha_actualizacion).toLocaleString(),
                    monto: 0, // Ajustar si el API lo devuelve
                    observaciones: ""
                }));

                setSolicitudes(transformadas);
            } catch (error) {
                console.error("Error cargando solicitudes:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    // --- LÓGICA DE FILTRADO (Se mantiene igual) ---
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        const cumpleBusqueda = !filtros.busqueda ||
            solicitud.expediente.toLowerCase().includes(filtros.busqueda.toLowerCase());
        const cumpleTipo = !filtros.tipo || solicitud.tipo === filtros.tipo;
        const cumpleEstado = !filtros.estado || solicitud.estado === filtros.estado;
        return cumpleBusqueda && cumpleTipo && cumpleEstado;
    });

    const solicitudesPaginadas = solicitudesFiltradas.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    // --- HELPERS VISUALES ---
    const getEstadoClasses = (estado: string) => {
        const estilos: Record<string, string> = {
            'PENDIENTE': 'badge-warning',
            'COMPLETADO': 'badge-success',
            'EN_PROCESO': 'badge-info',
            'OBSERVADO': 'badge-error',
        };
        return estilos[estado.toUpperCase()] || 'badge-ghost';
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
            {/* Header y Filtros (Igual que tu código original) */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Historial Real de Solicitudes</h1>
                <p className="text-gray-600">{solicitudesFiltradas.length} resultados encontrados</p>
            </div>

            {/* Tabla Principal */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-indigo-600 text-white">
                        <tr>
                            <th className="px-6 py-4">Expediente</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudesPaginadas.map(solicitud => (
                            <tr key={solicitud.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono font-bold">{solicitud.expediente}</td>
                                <td className="px-6 py-4">{solicitud.tipo}</td>
                                <td className="px-6 py-4">
                                    <span className={`badge ${getEstadoClasses(solicitud.estado)}`}>
                                        {solicitud.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{solicitud.fecha}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => setVistaDetalle(solicitud)}
                                        className="btn btn-sm btn-ghost text-indigo-600"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Aquí iría tu Modal de Detalle que ya tenías */}
        </div>
    );
}