import { useState } from "react";

type EstadoSolicitud = 'Pendiente' | 'Completado' | 'En Proceso' | 'Observado' | 'Cancelado';
type TipoSolicitud = 'Matrimonio' | 'Divorcio' | 'Nacimiento' | 'Defunción' | 'Copia de expediente';

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
}

export default function History() {
    // Datos de ejemplo
    const solicitudesData: Solicitud[] = [
        {
            id: 1,
            expediente: "EXP-2026-001245",
            tipo: "Matrimonio",
            solicitante: "María García López",
            dni: "12345678",
            estado: "Pendiente",
            fecha: "28/01/2026",
            fechaActualizacion: "28/01/2026 10:30",
            monto: 150.00
        },
        {
            id: 2,
            expediente: "EXP-2026-001244",
            tipo: "Matrimonio",
            solicitante: "Juan Pérez Torres",
            dni: "87654321",
            estado: "Completado",
            fecha: "27/01/2026",
            fechaActualizacion: "03/02/2026 15:45",
            monto: 150.00
        },
        {
            id: 3,
            expediente: "EXP-2026-001243",
            tipo: "Divorcio",
            solicitante: "Carlos Mendoza Ruiz",
            dni: "45678912",
            estado: "En Proceso",
            fecha: "27/01/2026",
            fechaActualizacion: "02/02/2026 09:20",
            monto: 280.00,
            observaciones: "Falta documentación adicional"
        },
        {
            id: 4,
            expediente: "EXP-2026-001242",
            tipo: "Copia de expediente",
            solicitante: "Ana Díaz Vega",
            dni: "78945612",
            estado: "Completado",
            fecha: "26/01/2026",
            fechaActualizacion: "27/01/2026 14:10",
            monto: 35.00
        },
        {
            id: 5,
            expediente: "EXP-2026-001241",
            tipo: "Divorcio",
            solicitante: "Luis Sánchez Paredes",
            dni: "32165498",
            estado: "Observado",
            fecha: "26/01/2026",
            fechaActualizacion: "28/01/2026 11:00",
            monto: 280.00,
            observaciones: "Documentos con inconsistencias"
        },
        {
            id: 6,
            expediente: "EXP-2026-001240",
            tipo: "Nacimiento",
            solicitante: "Rosa Flores Díaz",
            dni: "65432178",
            estado: "Completado",
            fecha: "25/01/2026",
            fechaActualizacion: "26/01/2026 16:30",
            monto: 50.00
        },
        {
            id: 7,
            expediente: "EXP-2026-001239",
            tipo: "Defunción",
            solicitante: "Roberto Castillo Mora",
            dni: "15975348",
            estado: "En Proceso",
            fecha: "25/01/2026",
            fechaActualizacion: "01/02/2026 10:15",
            monto: 80.00
        },
        {
            id: 8,
            expediente: "EXP-2026-001238",
            tipo: "Matrimonio",
            solicitante: "Patricia Rojas Vega",
            dni: "95175346",
            estado: "Cancelado",
            fecha: "24/01/2026",
            fechaActualizacion: "25/01/2026 08:45",
            observaciones: "Cancelado por el solicitante"
        },
        {
            id: 9,
            expediente: "EXP-2026-001237",
            tipo: "Nacimiento",
            solicitante: "Fernando López Ruiz",
            dni: "75395148",
            estado: "Completado",
            fecha: "23/01/2026",
            fechaActualizacion: "24/01/2026 13:20",
            monto: 50.00
        },
        {
            id: 10,
            expediente: "EXP-2026-001236",
            tipo: "Copia de expediente",
            solicitante: "Gabriela Torres Soto",
            dni: "35795124",
            estado: "Pendiente",
            fecha: "23/01/2026",
            fechaActualizacion: "23/01/2026 09:00",
            monto: 35.00
        }
    ];

    const [solicitudes] = useState<Solicitud[]>(solicitudesData);
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

    // Filtrar solicitudes
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        const cumpleBusqueda = !filtros.busqueda ||
            solicitud.expediente.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            solicitud.solicitante.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            solicitud.dni.includes(filtros.busqueda);

        const cumpleTipo = !filtros.tipo || solicitud.tipo === filtros.tipo;
        const cumpleEstado = !filtros.estado || solicitud.estado === filtros.estado;

        return cumpleBusqueda && cumpleTipo && cumpleEstado;
    });

    // Paginación
    const totalPaginas = Math.ceil(solicitudesFiltradas.length / itemsPorPagina);
    const solicitudesPaginadas = solicitudesFiltradas.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            tipo: '',
            estado: '',
            fechaInicio: '',
            fechaFin: ''
        });
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

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-10">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <i className="fas fa-history text-white text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Historial de Solicitudes</h1>
                            <p className="text-gray-600 text-sm mt-1">
                                {solicitudesFiltradas.length} solicitud{solicitudesFiltradas.length !== 1 ? 'es' : ''} encontrada{solicitudesFiltradas.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Estadísticas rápidas */}
                    <div className="flex gap-3">
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Pendientes</div>
                            <div className="text-xl font-bold text-amber-600">
                                {solicitudes.filter(s => s.estado === 'Pendiente').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Completados</div>
                            <div className="text-xl font-bold text-green-600">
                                {solicitudes.filter(s => s.estado === 'Completado').length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <i className="fas fa-filter text-indigo-600"></i>
                            Filtros de Búsqueda
                        </h3>
                        <button
                            onClick={limpiarFiltros}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                            <i className="fas fa-times-circle"></i>
                            Limpiar filtros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Búsqueda general */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar por expediente, nombre o DNI
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filtros.busqueda}
                                    onChange={(e) => {
                                        setFiltros({ ...filtros, busqueda: e.target.value });
                                        setPaginaActual(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Buscar..."
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>

                        {/* Tipo de solicitud */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Solicitud
                            </label>
                            <select
                                value={filtros.tipo}
                                onChange={(e) => {
                                    setFiltros({ ...filtros, tipo: e.target.value });
                                    setPaginaActual(1);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="Matrimonio">Matrimonio</option>
                                <option value="Divorcio">Divorcio</option>
                                <option value="Nacimiento">Nacimiento</option>
                                <option value="Defunción">Defunción</option>
                                <option value="Copia de expediente">Copia de expediente</option>
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => {
                                    setFiltros({ ...filtros, estado: e.target.value });
                                    setPaginaActual(1);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            </div>

            {/* Tabla de solicitudes */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Vista Desktop */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Expediente</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Solicitante</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">DNI</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Fecha</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Monto</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {solicitudesPaginadas.length > 0 ? (
                                    solicitudesPaginadas.map((solicitud) => {
                                        const tipoConfig = getTipoIcon(solicitud.tipo);
                                        return (
                                            <tr
                                                key={solicitud.id}
                                                className="hover:bg-indigo-50 transition-colors duration-200"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono font-semibold text-gray-900">
                                                        {solicitud.expediente}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <i className={`fas ${tipoConfig.icon} ${tipoConfig.color}`}></i>
                                                        <span className="text-gray-700">{solicitud.tipo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">
                                                    {solicitud.solicitante}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-gray-600">
                                                    {solicitud.dni}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${getEstadoClasses(solicitud.estado)}`}>
                                                        {solicitud.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {solicitud.fecha}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {solicitud.monto ? `S/ ${solicitud.monto.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => setVistaDetalle(solicitud)}
                                                            className="btn btn-sm btn-ghost text-indigo-600 hover:bg-indigo-100"
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-ghost text-gray-600 hover:bg-gray-100"
                                                            title="Descargar"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <i className="fas fa-inbox text-gray-300 text-5xl"></i>
                                                <p className="text-gray-500 font-medium">No se encontraron solicitudes</p>
                                                <button
                                                    onClick={limpiarFiltros}
                                                    className="btn btn-sm btn-outline btn-primary"
                                                >
                                                    Limpiar filtros
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Mobile - Cards */}
                    <div className="lg:hidden p-4 space-y-4">
                        {solicitudesPaginadas.length > 0 ? (
                            solicitudesPaginadas.map((solicitud) => {
                                const tipoConfig = getTipoIcon(solicitud.tipo);
                                return (
                                    <div
                                        key={solicitud.id}
                                        className="bg-linear-to-br from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <i className={`fas ${tipoConfig.icon} ${tipoConfig.color} text-lg`}></i>
                                                <span className="font-mono font-bold text-gray-900 text-sm">
                                                    {solicitud.expediente}
                                                </span>
                                            </div>
                                            <span className={`badge badge-sm ${getEstadoClasses(solicitud.estado)}`}>
                                                {solicitud.estado}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div>
                                                <div className="text-xs text-gray-500">Tipo</div>
                                                <div className="text-sm font-medium text-gray-900">{solicitud.tipo}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Solicitante</div>
                                                <div className="text-sm font-medium text-gray-900">{solicitud.solicitante}</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <div className="text-xs text-gray-500">DNI</div>
                                                    <div className="text-sm font-mono text-gray-900">{solicitud.dni}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs text-gray-500">Fecha</div>
                                                    <div className="text-sm text-gray-900">{solicitud.fecha}</div>
                                                </div>
                                            </div>
                                            {solicitud.monto && (
                                                <div>
                                                    <div className="text-xs text-gray-500">Monto</div>
                                                    <div className="text-sm font-bold text-gray-900">S/ {solicitud.monto.toFixed(2)}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setVistaDetalle(solicitud)}
                                                className="btn btn-sm btn-outline btn-primary flex-1"
                                            >
                                                <i className="fas fa-eye"></i>
                                                Ver detalles
                                            </button>
                                            <button className="btn btn-sm btn-outline btn-ghost">
                                                <i className="fas fa-download"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <i className="fas fa-inbox text-gray-300 text-5xl mb-3"></i>
                                <p className="text-gray-500 font-medium mb-4">No se encontraron solicitudes</p>
                                <button
                                    onClick={limpiarFiltros}
                                    className="btn btn-sm btn-outline btn-primary"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Paginación */}
                    {solicitudesFiltradas.length > itemsPorPagina && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Mostrando {((paginaActual - 1) * itemsPorPagina) + 1} - {Math.min(paginaActual * itemsPorPagina, solicitudesFiltradas.length)} de {solicitudesFiltradas.length}
                                </div>
                                <div className="join">
                                    <button
                                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                        disabled={paginaActual === 1}
                                        className="join-item btn btn-sm"
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    {[...Array(totalPaginas)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPaginaActual(i + 1)}
                                            className={`join-item btn btn-sm ${paginaActual === i + 1 ? 'btn-primary' : ''}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                        disabled={paginaActual === totalPaginas}
                                        className="join-item btn btn-sm"
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalle */}
            {vistaDetalle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
                        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Detalle de Solicitud</h3>
                            <button
                                onClick={() => setVistaDetalle(null)}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Información principal */}
                            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <i className={`fas ${getTipoIcon(vistaDetalle.tipo).icon} ${getTipoIcon(vistaDetalle.tipo).color} text-2xl`}></i>
                                        <div>
                                            <div className="font-mono font-bold text-lg text-gray-900">{vistaDetalle.expediente}</div>
                                            <div className="text-sm text-gray-600">{vistaDetalle.tipo}</div>
                                        </div>
                                    </div>
                                    <span className={`badge badge-lg ${getEstadoClasses(vistaDetalle.estado)}`}>
                                        {vistaDetalle.estado}
                                    </span>
                                </div>
                            </div>

                            {/* Datos del solicitante */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <i className="fas fa-user text-indigo-600"></i>
                                    Datos del Solicitante
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Nombre Completo</div>
                                        <div className="font-medium text-gray-900">{vistaDetalle.solicitante}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">DNI</div>
                                        <div className="font-mono font-medium text-gray-900">{vistaDetalle.dni}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Fechas */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <i className="fas fa-calendar text-indigo-600"></i>
                                    Fechas
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Fecha de Solicitud</div>
                                        <div className="font-medium text-gray-900">{vistaDetalle.fecha}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Última Actualización</div>
                                        <div className="font-medium text-gray-900">{vistaDetalle.fechaActualizacion}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Monto */}
                            {vistaDetalle.monto && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <i className="fas fa-money-bill-wave text-indigo-600"></i>
                                        Información de Pago
                                    </h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="text-sm text-green-700 mb-1">Monto Total</div>
                                        <div className="text-2xl font-bold text-green-900">S/ {vistaDetalle.monto.toFixed(2)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Observaciones */}
                            {vistaDetalle.observaciones && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <i className="fas fa-comment-alt text-indigo-600"></i>
                                        Observaciones
                                    </h4>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm text-amber-900">{vistaDetalle.observaciones}</p>
                                    </div>
                                </div>
                            )}

                            {/* Acciones */}
                            <div className="flex gap-3 pt-4">
                                <button className="btn btn-primary flex-1">
                                    <i className="fas fa-print"></i>
                                    Imprimir
                                </button>
                                <button className="btn btn-outline btn-primary flex-1">
                                    <i className="fas fa-download"></i>
                                    Descargar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}