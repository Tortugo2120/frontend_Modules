import { useState, useEffect } from "react";
import { ListApplications } from "../../services/AplicationServices"; 
import type { ApplicationItem } from "../../model/aplicationModel";

type EstadoSolicitud = 'Pendiente' | 'Completado' | 'En Proceso' | 'Observado' | 'Cancelado';
type TipoSolicitud = 'Matrimonio' | 'Divorcio' | 'Nacimiento' | 'Defunción' | 'Copia de expediente';

const MAP_TIPOS: Record<number, TipoSolicitud> = {
    1: 'Matrimonio',
    2: 'Divorcio',
    3: 'Nacimiento',
    4: 'Defunción',
    5: 'Copia de expediente'
};

interface Solicitud {
    id: number;
    expediente: string;
    tipo: TipoSolicitud;
    solicitante: string;
    dni: string;
    estado: EstadoSolicitud;
    fecha: string;
    fechaActualizacion: string;
    monto?: number;
    observaciones?: string;
    idUsuario: number;
    fechaFin: string | null;
}

export default function History() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                setLoading(true);
                setError(null);
                const applications: ApplicationItem[] = await ListApplications();
                
                const dataMapeada: Solicitud[] = applications.map((item) => ({
                    id: item.id,
                    expediente: item.numero_expediente,
                    tipo: MAP_TIPOS[item.id_tipo_solicitud] || 'Copia de expediente',
                    solicitante: `Usuario ${item.id_usuario}`, 
                    dni: "Consultar detalle", 
                    estado: formatearEstado(item.estado),
                    fecha: new Date(item.fecha_inicio).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    fechaActualizacion: item.fecha_actualizacion 
                        ? new Date(item.fecha_actualizacion).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : 'No actualizada',
                    fechaFin: item.fecha_fin,
                    idUsuario: item.id_usuario,
                    monto: 0,
                    observaciones: item.estado === 'OBSERVADO' ? "Revisar documentos" : ""
                }));

                setSolicitudes(dataMapeada);
            } catch (error) {
                console.error("Error al cargar solicitudes:", error);
                setError("No se pudieron cargar las solicitudes. Por favor, intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchSolicitudes();
    }, []);

    const formatearEstado = (estadoRaw: string): EstadoSolicitud => {
        const est = estadoRaw.toUpperCase();
        if (est.includes('PENDIENTE')) return 'Pendiente';
        if (est.includes('COMPLETO') || est.includes('FINALIZADO')) return 'Completado';
        if (est.includes('PROCESO')) return 'En Proceso';
        if (est.includes('OBSERVADO')) return 'Observado';
        return 'Cancelado';
    };

    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        const cumpleBusqueda = !filtros.busqueda ||
            solicitud.expediente.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            solicitud.solicitante.toLowerCase().includes(filtros.busqueda.toLowerCase());

        const cumpleTipo = !filtros.tipo || solicitud.tipo === filtros.tipo;
        const cumpleEstado = !filtros.estado || solicitud.estado === filtros.estado;

        return cumpleBusqueda && cumpleTipo && cumpleEstado;
    });

    const totalPaginas = Math.ceil(solicitudesFiltradas.length / itemsPorPagina);
    const solicitudesPaginadas = solicitudesFiltradas.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    const limpiarFiltros = () => {
        setFiltros({ busqueda: '', tipo: '', estado: '', fechaInicio: '', fechaFin: '' });
        setPaginaActual(1);
    };

    const getEstadoClasses = (estado: EstadoSolicitud) => {
        const estilos: Record<EstadoSolicitud, string> = {
            'Pendiente': 'badge-warning',
            'Completado': 'badge-success',
            'En Proceso': 'badge-info',
            'Observado': 'badge-error',
            'Cancelado': 'badge-ghost'
        };
        return estilos[estado] || 'badge-ghost';
    };

    const getTipoIcon = (tipo: TipoSolicitud) => {
        const iconos: Record<TipoSolicitud, { icon: string; color: string }> = {
            'Matrimonio': { icon: 'fa-rings-wedding', color: 'text-pink-600' },
            'Divorcio': { icon: 'fa-heart-broken', color: 'text-red-600' },
            'Nacimiento': { icon: 'fa-baby', color: 'text-blue-600' },
            'Defunción': { icon: 'fa-cross', color: 'text-gray-600' },
            'Copia de expediente': { icon: 'fa-copy', color: 'text-teal-600' }
        };
        return iconos[tipo] || { icon: 'fa-file', color: 'text-gray-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                    <p className="text-gray-500 font-medium">Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Error al cargar</h3>
                        <p className="text-gray-600 text-center">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="btn bg-indigo-600 text-white"
                        >
                            <i className="fas fa-redo mr-2"></i>
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-10">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <i className="fas fa-history text-white text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Historial de Solicitudes</h1>
                            <p className="text-gray-600 text-sm mt-1">
                                {solicitudesFiltradas.length} solicitud{solicitudesFiltradas.length !== 1 ? 'es' : ''} encontrada{solicitudesFiltradas.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-white/60">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <i className="fas fa-filter text-indigo-600"></i>
                            Filtros de Búsqueda
                        </h3>
                        <button 
                            onClick={limpiarFiltros} 
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
                        >
                            <i className="fas fa-times-circle"></i> Limpiar filtros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filtros.busqueda}
                                    onChange={(e) => { 
                                        setFiltros({ ...filtros, busqueda: e.target.value }); 
                                        setPaginaActual(1); 
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="Buscar por expediente o solicitante..."
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        <select
                            value={filtros.tipo}
                            onChange={(e) => { 
                                setFiltros({ ...filtros, tipo: e.target.value }); 
                                setPaginaActual(1); 
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                            <option value="">Todos los tipos</option>
                            {Object.values(MAP_TIPOS).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <select
                            value={filtros.estado}
                            onChange={(e) => { 
                                setFiltros({ ...filtros, estado: e.target.value }); 
                                setPaginaActual(1); 
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                            <option value="">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Completado">Completado</option>
                            <option value="Observado">Observado</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {solicitudesPaginadas.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-folder-open text-gray-400 text-3xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No se encontraron solicitudes
                            </h3>
                            <p className="text-gray-500">
                                {filtros.busqueda || filtros.tipo || filtros.estado
                                    ? 'Intenta ajustar los filtros de búsqueda'
                                    : 'Aún no hay solicitudes registradas'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Expediente</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Fecha Inicio</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {solicitudesPaginadas.map((solicitud) => {
                                        const tipoConfig = getTipoIcon(solicitud.tipo);
                                        return (
                                            <tr 
                                                key={solicitud.id} 
                                                className="hover:bg-indigo-50/50 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 font-mono font-semibold text-indigo-700">
                                                    {solicitud.expediente}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <i className={`fas ${tipoConfig.icon} ${tipoConfig.color}`}></i>
                                                        <span className="text-gray-700">{solicitud.tipo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${getEstadoClasses(solicitud.estado)} border-none py-3 px-4`}>
                                                        {solicitud.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{solicitud.fecha}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => setVistaDetalle(solicitud)}
                                                            className="btn btn-sm btn-circle btn-ghost text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="flex items-center justify-between mt-6 bg-white rounded-xl shadow-lg px-6 py-4">
                        <div className="text-sm text-gray-600">
                            Página {paginaActual} de {totalPaginas}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                                disabled={paginaActual === 1}
                                className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button
                                onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                                disabled={paginaActual === totalPaginas}
                                className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {vistaDetalle && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-fadeIn">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <i className="fas fa-file-alt"></i>
                                Detalles del Expediente
                            </h3>
                            <button 
                                onClick={() => setVistaDetalle(null)} 
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                                    <p className="text-xs text-indigo-600 uppercase font-bold mb-1">Número de Expediente</p>
                                    <p className="font-mono text-2xl text-indigo-700 font-bold">{vistaDetalle.expediente}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Estado</p>
                                    <span className={`badge ${getEstadoClasses(vistaDetalle.estado)} py-2 px-3`}>
                                        {vistaDetalle.estado}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">ID Usuario</p>
                                    <p className="text-gray-800">{vistaDetalle.idUsuario}</p>
                                </div>
                                <div className="col-span-2 border-t pt-4">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">Tipo de Solicitud</p>
                                    <p className="text-gray-800 flex items-center gap-2 text-lg">
                                        <i className={`fas ${getTipoIcon(vistaDetalle.tipo).icon} ${getTipoIcon(vistaDetalle.tipo).color}`}></i>
                                        {vistaDetalle.tipo}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Fecha de Inicio</p>
                                    <p className="text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-calendar-alt text-gray-400"></i>
                                        {vistaDetalle.fecha}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Última Actualización</p>
                                    <p className="text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-clock text-gray-400"></i>
                                        {vistaDetalle.fechaActualizacion}
                                    </p>
                                </div>
                                {vistaDetalle.fechaFin && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Fecha de Fin</p>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <i className="fas fa-calendar-check text-green-600"></i>
                                            {new Date(vistaDetalle.fechaFin).toLocaleDateString('es-PE')}
                                        </p>
                                    </div>
                                )}
                                {vistaDetalle.observaciones && (
                                    <div className="col-span-2 border-t pt-4">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Observaciones</p>
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                            <p className="text-sm text-yellow-800">
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                {vistaDetalle.observaciones}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setVistaDetalle(null)}
                                className="w-full btn bg-indigo-600 hover:bg-indigo-700 text-white mt-4 transition-colors"
                            >
                                <i className="fas fa-times-circle mr-2"></i>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}