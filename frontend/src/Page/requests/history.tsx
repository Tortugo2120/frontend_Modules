import { useApplicationHistory } from "../../hooks/useApplicationHistory";
import { useNavigate, Link } from "react-router-dom";

// Funciones helper (mantén las que ya tienes)
const getEstadoClasses = (estado: string): string => {
    const estadoNormalizado = estado.toLowerCase();
    const clases: Record<string, string> = {
        "pendiente": "bg-yellow-100 text-yellow-800",
        "en proceso": "bg-blue-100 text-blue-800",
        "completado": "bg-green-100 text-green-800",
        "observado": "bg-orange-100 text-orange-800",
        "cancelado": "bg-red-100 text-red-800",
        "anulada": "bg-red-100 text-red-800"
    };
    return clases[estadoNormalizado] || "bg-gray-100 text-gray-800";
};

const formatearFechaHora = (fecha: string): string => {
    try {
        const date = new Date(fecha);
        return date.toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',

        });
    } catch {
        return fecha;
    }
};

const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(precio);
};

export default function History() {
    const navigate = useNavigate();
    const {
        solicitudes,
        loading,
        error,
        filtros,
        setFiltros,
        paginaActual,
        totalPaginas,
        totalRegistros,
        limpiarFiltros,
        tiposUnicos,
        estadosUnicos,
        cambiarPagina
    } = useApplicationHistory();

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
                            className="btn bg-indigo-600 text-white hover:bg-indigo-700"
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
        <div className="min-h-screen bg-blue-300/40 from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-6">
            {/* Header */}
            <div className=" mx-auto mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-info-content rounded-xl flex items-center justify-center shadow-lg">
                            <i className="fas fa-history text-white text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Historial de Solicitudes</h1>
                            <p className="text-gray-600 text-sm mt-1">
                                {totalRegistros} solicitud{totalRegistros !== 1 ? 'es' : ''} encontrada{totalRegistros !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <i className="fas fa-filter text-slate-600"></i>
                            Filtros de Búsqueda
                        </h3>
                        {(filtros.busqueda || filtros.tipo || filtros.estado) && (
                            <button
                                onClick={limpiarFiltros}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                <i className="fas fa-times-circle"></i> Limpiar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Búsqueda por Expediente o DNI */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filtros.busqueda}
                                    onChange={(e) => setFiltros({ busqueda: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Buscar por número de expediente o DNI..." // 👈 Cambiado
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                {filtros.busqueda && (
                                    <button
                                        onClick={() => setFiltros({ busqueda: "" })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Limpiar búsqueda"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtro por Tipo de Solicitud */}
                        <div>
                            <select
                                value={filtros.tipo}
                                onChange={(e) => setFiltros({ tipo: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="">Todos los tipos</option>
                                {tiposUnicos.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Estado */}
                        <div>
                            <select
                                value={filtros.estado}
                                onChange={(e) => setFiltros({ estado: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="">Todos los estados</option>
                                {estadosUnicos.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Indicadores de filtros activos */}
                    {(filtros.busqueda || filtros.tipo || filtros.estado) && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
                            {filtros.busqueda && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                    <i className="fas fa-search text-xs"></i>
                                    "{filtros.busqueda}"
                                    <button
                                        onClick={() => setFiltros({ busqueda: "" })}
                                        className="hover:text-indigo-900 transition-colors"
                                        title="Quitar filtro"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </span>
                            )}
                            {filtros.tipo && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    <i className="fas fa-file-alt text-xs"></i>
                                    {filtros.tipo}
                                    <button
                                        onClick={() => setFiltros({ tipo: "" })}
                                        className="hover:text-blue-900 transition-colors"
                                        title="Quitar filtro"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </span>
                            )}
                            {filtros.estado && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    <i className="fas fa-info-circle text-xs"></i>
                                    {filtros.estado}
                                    <button
                                        onClick={() => setFiltros({ estado: "" })}
                                        className="hover:text-green-900 transition-colors"
                                        title="Quitar filtro"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Paginación */}
            {totalPaginas > 1 && (
                <div className="flex flex-col sticky top-23 z-3 sm:flex-row items-center justify-between gap-4 mt-6 bg-white rounded-t-md shadow-lg px-5 py-3">
                    <div className="text-sm text-gray-600">
                        Mostrando {solicitudes.length} de {totalRegistros} solicitudes (Página {paginaActual} de {totalPaginas})
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => cambiarPagina(1)}
                            disabled={paginaActual === 1}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            title="Primera página"
                        >
                            <i className="fas fa-angle-double-left"></i>
                        </button>
                        <button
                            onClick={() => cambiarPagina(paginaActual - 1)}
                            disabled={paginaActual === 1}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                let pageNum;
                                if (totalPaginas <= 5) {
                                    pageNum = i + 1;
                                } else if (paginaActual <= 3) {
                                    pageNum = i + 1;
                                } else if (paginaActual >= totalPaginas - 2) {
                                    pageNum = totalPaginas - 4 + i;
                                } else {
                                    pageNum = paginaActual - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => cambiarPagina(pageNum)}
                                        className={`btn btn-sm ${paginaActual === pageNum
                                            ? 'bg-info-content text-white hover:bg-info-content/95'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => cambiarPagina(paginaActual + 1)}
                            disabled={paginaActual === totalPaginas}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                        <button
                            onClick={() => cambiarPagina(totalPaginas)}
                            disabled={paginaActual === totalPaginas}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            title="Última página"
                        >
                            <i className="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                </div>
            )}
            {/* Tabla */}
            <div className=" mx-auto">
                <div className="bg-white rounded-b-md shadow-xl overflow-hidden border-0">
                    {solicitudes.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-folder-open text-gray-400 text-3xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No se encontraron solicitudes
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {filtros.busqueda || filtros.tipo || filtros.estado
                                    ? 'No hay resultados con los filtros aplicados'
                                    : 'Aún no hay solicitudes registradas'}
                            </p>
                            {(filtros.busqueda || filtros.tipo || filtros.estado) && (
                                <button
                                    onClick={limpiarFiltros}
                                    className="btn bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    <i className="fas fa-times-circle mr-2"></i>
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        < div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <thead className="bg-info-content text-white">
                                    <tr>
                                        <th className="px-2 py-3 w-35 text-center text-sm font-semibold">Expediente</th>
                                        <th className="px-2 py-3 w-45 text-center text-sm font-semibold">Tipo de Solicitud</th>
                                        <th className="px-2 py-3 w-65 text-center text-sm font-semibold">Contrayentes</th>
                                        <th className="px-2 py-3 w-32 text-center text-sm font-semibold">DNI/CIU</th>
                                        <th className="px-2 py-3 text-center text-sm font-semibold">Fecha Trámite</th>
                                        <th className="px-2 py-3 w-36 text-center text-sm font-semibold">Estado</th>
                                        <th className="px-2 py-3 text-center text-sm font-semibold">Precio</th>
                                        <th className="px-2 py-3 text-center text-sm font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {solicitudes.map((solicitud) => (
                                        <tr
                                            key={solicitud.id}
                                            className="hover:bg-indigo-100/50 transition-colors duration-150 border-b border-b-gray-300"
                                        >
                                            <td className="px-4 font-mono font-semibold text-gray-800">
                                                <Link to={`/dashboard/solicitud/detalles/${solicitud.id}`}>
                                                    {solicitud.expediente}
                                                </Link>
                                            </td>
                                            <td className="py-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">{solicitud.nombreSolicitud}</p>
                                                    <p className="text-sm font-semibold text-gray-800">{solicitud.descripcionSolicitud}</p>
                                                </div>
                                            </td>
                                            {/* Celda de Contrayentes modificada */}
                                            <td className="px-3 text-gray-600 ">
                                                <div className="flex flex-col gap-1">
                                                    {solicitud.participantes && solicitud.participantes.length > 0 ? (
                                                        solicitud.participantes
                                                            .filter(p => p.rol.toLowerCase().includes('contrayente'))
                                                            .map((p, idx) => (


                                                                <span key={idx} className="text-sm font-medium">{p.nombre}</span>

                                                            ))
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">No registrados</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className=" text-md text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                    {solicitud.participantes && solicitud.participantes.length > 0 ? (
                                                        solicitud.participantes
                                                            .filter(p => p.rol.toLowerCase().includes('contrayente'))
                                                            .map((p, idx) => (
                                                                <div key={idx} className="flex flex-row">
                                                                    <span className="text-sm font-black pl-1">{p.tipo_identificacion}: {p.numero_identificacion}</span>
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">No registrados</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-md text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <i className="far fa-calendar-alt text-indigo-400"></i>
                                                    {formatearFechaHora(solicitud.fecha)}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${getEstadoClasses(solicitud.estado)} border-none py-3 px-4`}>
                                                    {solicitud.estado}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="font-semibold text-green-600">
                                                    {formatearPrecio(solicitud.precio)}
                                                </span>
                                            </td>
                                            <td className="pr-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/solicitud/detalles/${solicitud.id}`)}
                                                        className="btn btn-sm btn-circle btn-ghost text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => console.log("Editar solicitud", solicitud.id)}
                                                        className="btn btn-sm btn-circle btn-ghost text-amber-600 hover:bg-amber-100 transition-colors"
                                                        title="Editar solicitud"
                                                    >
                                                        <i className="fas fa-pen-to-square"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>


            </div>

        </div >
    );
}