import { useParams, useNavigate } from "react-router-dom";
import { useDetailsApplication } from "../../hooks/useApplicationDetails";

const ACTION_CARDS = [
    {
        key: "testigos",
        label: "Testigos",
        description: "Agregar o modificar los testigos de la solicitud",
        icon: "fa-users",
        color: "indigo",
        route: (id: string) => `/dashboard/actualizar/testigos/${id}`,
    },
    {
        key: "requerimientos",
        label: "Requerimientos",
        description: "Revisar y actualizar el estado de los requisitos",
        icon: "fa-clipboard-list",
        color: "blue",
        route: (id: string) => `/dashboard/actualizar/requerimientos/${id}`,
    },
    {
        key: "matrimonio",
        label: "Detalles del Matrimonio",
        description: "Editar la información del acto matrimonial",
        icon: "fa-ring",
        color: "pink",
        route: (id: string) => `/dashboard/actualizar/matrimonio/${id}`,
    },
    {
        key: "pagos",
        label: "Pagos",
        description: "Confirmar y registrar los pagos asociados",
        icon: "fa-credit-card",
        color: "green",
        route: (id: string) => `/dashboard/actualizar/pagos/${id}`,
    },
];

const colorMap: Record<string, { bg: string; iconBg: string; iconText: string; btn: string; badge: string }> = {
    indigo: { bg: "hover:border-indigo-300 hover:shadow-indigo-100", iconBg: "bg-indigo-100", iconText: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
    blue: { bg: "hover:border-blue-300   hover:shadow-blue-100", iconBg: "bg-blue-100", iconText: "text-blue-600", btn: "bg-blue-600   hover:bg-blue-700", badge: "bg-blue-100 text-blue-700" },
    pink: { bg: "hover:border-pink-300   hover:shadow-pink-100", iconBg: "bg-pink-100", iconText: "text-pink-600", btn: "bg-pink-600   hover:bg-pink-700", badge: "bg-pink-100 text-pink-700" },
    green: { bg: "hover:border-green-300  hover:shadow-green-100", iconBg: "bg-green-100", iconText: "text-green-600", btn: "bg-green-600  hover:bg-green-700", badge: "bg-green-100 text-green-700" },
};

const estadoClasses: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    EN_PROCESO: "bg-blue-100   text-blue-700",
    COMPLETADO: "bg-green-100  text-green-700",
    CANCELADO: "bg-red-100    text-red-700",
};

const formatFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Update_Page = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { application, loading } = useDetailsApplication(id);

    const contrayentes = application?.participantes.filter(p => p.rol === "CONTRAYENTE") ?? [];
    const testigos = application?.participantes.filter(p => p.rol === "TESTIGO") ?? [];
    const reqTotal = application?.requisitos.length ?? 0;
    const reqEntregados = application?.requisitos.filter(r => r.estado_entrega === "Entregado").length ?? 0;
    const pagado = application?.pago?.pagado === "1";

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 text-md text-gray-400 mb-2">
                        <button onClick={() => navigate(-1)} className="hover:text-indigo-600 transition-colors">
                            <i className="fas fa-arrow-left mr-1"></i>Volver
                        </button>
                        <span>/</span>
                        <span>Actualizar Solicitud</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        <i className="fas fa-file-pen mr-2 text-indigo-500"></i>
                        Actualizar Solicitud
                        <span className="ml-2 text-sm font-normal text-gray-400">{application?.expediente}</span>
                    </h1>
                </div>
            </div>

            {/* Resumen de la solicitud */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                {loading ? (
                    <div className="flex items-center justify-center h-28 gap-3 text-gray-400">
                        <span className="loading loading-spinner loading-md text-indigo-500"></span>
                        <span className="text-sm">Cargando información...</span>
                    </div>
                ) : application ? (
                    <div>
                        {/* Título y estado */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoClasses[application.estado] ?? "bg-gray-100 text-gray-600"}`}>
                                    {application.estado}
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 mt-2">{application.nombreSolicitud}</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{application.descripcionSolicitud}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">S/ {application.precio.toFixed(2)}</p>
                                <p className="text-xs text-gray-400">N° expediente: <span className="font-semibold text-gray-600">{application.expediente}</span></p>
                            </div>
                        </div>

                        {/* Datos rápidos */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Inicio</p>
                                <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatFecha(application.fechaInicio)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Encargado</p>
                                <p className="text-sm font-semibold text-gray-700 mt-0.5 truncate">{application.encargado}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Requerimientos</p>
                                <p className="text-sm font-semibold text-gray-700 mt-0.5">
                                    <span className="text-green-600">{reqEntregados}</span>/{reqTotal} entregados
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pago</p>
                                <p className={`text-sm font-semibold mt-0.5 ${pagado ? "text-green-600" : "text-yellow-600"}`}>
                                    <i className={`fas ${pagado ? "fa-check-circle" : "fa-clock"} mr-1`}></i>
                                    {pagado ? "Pagado" : "Pendiente"}
                                </p>
                            </div>
                        </div>

                        {/* Participantes */}
                        {(contrayentes.length > 0 || testigos.length > 0) && (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Participantes</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-md font-semibold text-indigo-600">Contrayentes</span>
                                        <div className="flex items-center flex-wrap gap-2 mt-1">

                                            {contrayentes.map((p, i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                                                    <i className="fas fa-user text-indigo-400"></i>{p.nombre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-md font-semibold text-green-600">Testigos</span>
                                        <div className="flex items-center flex-wrap gap-2 mt-1">
                                        {testigos.map((p, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 text-green-600 text-xs font-medium px-3 py-1 rounded-full">
                                                <i className="fas fa-user-friends text-green-400"></i>{p.nombre}
                                            </span>
                                        ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detalles del Matrimonio */}
                        {application.matrimonio && (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                    <i className="fas fa-ring text-pink-400 mr-1.5"></i>Detalles del Matrimonio
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-pink-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Fecha</p>
                                        <p className="text-sm font-semibold text-gray-700 mt-0.5">
                                            {new Date(application.matrimonio.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="bg-pink-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Hora</p>
                                        <p className="text-sm font-semibold text-gray-700 mt-0.5">
                                            {application.matrimonio.hora.slice(0, 5)}
                                        </p>
                                    </div>
                                    <div className="bg-pink-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Dirección</p>
                                        <p className="text-sm font-semibold text-gray-700 mt-0.5 truncate">
                                            {application.matrimonio.direccion}
                                        </p>
                                    </div>
                                    <div className="bg-pink-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Oficiante</p>
                                        <p className="text-sm font-semibold text-gray-700 mt-0.5 truncate">
                                            {application.matrimonio.oficiante}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-8">No se pudo cargar la información de la solicitud.</p>
                )}
            </div>

            {/* Tarjetas de acción */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Selecciona una sección para editar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ACTION_CARDS.map(card => {
                    const c = colorMap[card.color];
                    return (
                        <button
                            key={card.key}
                            onClick={() => id && navigate(card.route(id))}
                            className={`group text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${c.bg}`}
                        >
                            <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                <i className={`fas ${card.icon} ${c.iconText} text-lg`}></i>
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">{card.label}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4">{card.description}</p>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${c.badge}`}>
                                Editar <i className="fas fa-arrow-right text-xs"></i>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Update_Page;