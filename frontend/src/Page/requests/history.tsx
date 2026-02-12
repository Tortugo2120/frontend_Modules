import { useApplicationHistory } from "../../hooks/useApplicationHistory";

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

const getRolIcon = (rol: string): string => {
    const rolNormalizado = rol.toLowerCase();
    if (rolNormalizado.includes('contrayente')) return 'fa-rings-wedding';
    if (rolNormalizado.includes('testigo')) return 'fa-user-check';
    if (rolNormalizado.includes('solicitante')) return 'fa-user';
    return 'fa-user-circle';
};

const getRolColor = (rol: string): string => {
    const rolNormalizado = rol.toLowerCase();
    if (rolNormalizado.includes('contrayente')) return 'text-pink-600';
    if (rolNormalizado.includes('testigo')) return 'text-blue-600';
    if (rolNormalizado.includes('solicitante')) return 'text-indigo-600';
    return 'text-gray-600';
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
    const {
        solicitudes,
        loading,
        error,
        filtros,
        setFiltros,
        paginaActual,
        totalPaginas,
        totalRegistros,
        vistaDetalle,
        setVistaDetalle,
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
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-700 from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                            <i className="fas fa-filter text-indigo-600"></i>
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

            {/* Tabla */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-md shadow-xl overflow-hidden border-0">
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
                        < div className="overflow-x-auto  ">
                            <table className="w-full ">
                                <thead className="bg-slate-700 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Expediente</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Tipo de Solicitud</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Contrayentes</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Fecha Trámite</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Precio</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {solicitudes.map((solicitud) => (
                                        <tr
                                            key={solicitud.id}
                                            className="hover:bg-indigo-50/50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 font-mono  font-semibold text-indigo-700">
                                                {solicitud.expediente}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">{solicitud.nombreSolicitud}</p>
                                                    <p className="text-sm font-semibold text-gray-800">{solicitud.descripcionSolicitud}</p>
                                                </div>
                                            </td>
                                            {/* Celda de Contrayentes modificada */}
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                    {solicitud.participantes && solicitud.participantes.length > 0 ? (
                                                        solicitud.participantes
                                                            .filter(p => p.rol.toLowerCase().includes('contrayente'))
                                                            .map((p, idx) => (
                                                                <div key={idx} className="flex flex-col items-center">
                                                                    <i className="fas fa-rings-wedding text-pink-500 text-xs"></i>
                                                                    <span className="text-sm font-medium">{p.nombre}</span>
                                                                    <span className="text-sm font-black">{p.tipo_identificacion}: {p.numero_identificacion}</span>
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">No registrados</span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Celda de Fecha añadida */}
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <i className="far fa-calendar-alt text-indigo-400"></i>
                                                    {formatearFechaHora(solicitud.fecha)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getEstadoClasses(solicitud.estado)} border-none py-3 px-4`}>
                                                    {solicitud.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-green-600">
                                                    {formatearPrecio(solicitud.precio)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setVistaDetalle(solicitud)}
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

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white rounded-xl shadow-lg px-6 py-4">
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
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
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
            </div>

            {/* Modal */}
            {
                vistaDetalle && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                            <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
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
                            <div className="p-6 space-y-6">
                                {/* Resto del modal igual... */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                                        <p className="text-xs text-indigo-600 uppercase font-bold mb-1">Número de Expediente</p>
                                        <p className="font-mono text-2xl text-indigo-700 font-bold">{vistaDetalle.expediente}</p>
                                    </div>

                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Tipo de Solicitud</p>
                                        <div className="bg-linear-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200">
                                            <p className="text-gray-800 font-bold text-lg flex items-center gap-2">
                                                <i className="fas fa-file-contract text-indigo-600"></i>
                                                {vistaDetalle.nombreSolicitud}
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1">{vistaDetalle.descripcionSolicitud}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Estado</p>
                                        <span className={`badge ${getEstadoClasses(vistaDetalle.estado)} py-2 px-3`}>
                                            {vistaDetalle.estado}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Precio</p>
                                        <p className="flex items-center gap-2 text-lg font-bold text-green-600">
                                            {formatearPrecio(vistaDetalle.precio)}
                                        </p>
                                    </div>

                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Encargado</p>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <i className="fas fa-user-tie text-gray-400"></i>
                                            {vistaDetalle.encargado}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Fecha de Inicio</p>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <i className="fas fa-calendar-alt text-gray-400"></i>
                                            {formatearFechaHora(vistaDetalle.fecha)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Última Actualización</p>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <i className="fas fa-clock text-gray-400"></i>
                                            {formatearFechaHora(vistaDetalle.fechaActualizacion)}
                                        </p>
                                    </div>
                                    {vistaDetalle.fechaFin && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Fecha de Fin</p>
                                            <p className="text-gray-800 flex items-center gap-2">
                                                <i className="fas fa-calendar-check text-green-600"></i>
                                                {formatearFechaHora(vistaDetalle.fechaFin)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Participantes */}
                                {vistaDetalle.participantes && vistaDetalle.participantes.length > 0 ? (
                                    <div className="border-t pt-6">
                                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <i className="fas fa-users text-indigo-600"></i>
                                            Participantes ({vistaDetalle.participantes.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {vistaDetalle.participantes.map((participante, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-linear-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${getRolColor(participante.rol)}`}>
                                                            <i className={`fas ${getRolIcon(participante.rol)}`}></i>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900">{participante.nombre}</p>
                                                            <p className="text-sm text-gray-500 uppercase font-medium">{participante.rol}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t pt-6">
                                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                                            <i className="fas fa-users-slash text-gray-400 text-3xl mb-2"></i>
                                            <p className="text-gray-600">No hay participantes registrados</p>
                                        </div>
                                    </div>
                                )}

                                {vistaDetalle.observaciones && (
                                    <div className="border-t pt-6">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Observaciones</p>
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                            <p className="text-sm text-yellow-800">
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                {vistaDetalle.observaciones}
                                            </p>
                                        </div>
                                    </div>
                                )}

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
                )
            }
        </div >
    );
}