import type { ApplicationItem } from "../../../model/aplicationModel.ts";
import { Link, useNavigate } from "react-router-dom";

interface Props {
    data: ApplicationItem[]
}
export default function TableList({ data }: Props) {
    const navigate = useNavigate();
    if (data.length === 0) {
        return (
            <div className="p-12 text-center">
                <h3>No se encontraron solicitudes</h3>
            </div>
        );
    }
    const getEstadoClasses = (estado: string): string => {
        const estadoNormalizado = estado.toLowerCase();
        const clases: Record<string, string> = {
            "pendiente": "bg-yellow-100 text-yellow-800",
            "en proceso": "bg-blue-100 text-blue-800",
            "completada": "bg-green-100 text-green-800",
            "observado": "bg-orange-100 text-orange-800",
            "cancelado": "bg-red-100 text-red-800",
            "anulada": "bg-red-100 text-red-800"
        };
        return clases[estadoNormalizado] || "bg-gray-100 text-gray-800";
    };

    const getEstadoIcon = (estado: string): string => {
        const estadoNormalizado = estado.toLowerCase();
        const iconos: Record<string, string> = {
            "pendiente": "fa-clock",
            "en proceso": "fa-spinner",
            "completada": "fa-check-circle",
            "anulada": "fa-ban",
            "cancelado": "fa-ban",
            "observado": "fa-exclamation-circle"
        };
        return iconos[estadoNormalizado] || "fa-circle";
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

    return (
        <div className={"mx-auto"}>
            <div className={"bg-white rounded-b-md shadow-xl overflow-hidden border-0"}>

                {/* Vista móvil - Cards */}
                <div className="block lg:hidden divide-y divide-gray-200">
                    {data.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-indigo-50/50 transition-colors">
                            {/* Header de la card */}
                            <div className="flex items-center justify-between mb-3">
                                <Link
                                    to="/dashboard/solicitud/detalles"
                                    state={{ id: item.id }}
                                    className="font-mono font-bold text-indigo-700 text-sm hover:underline"
                                >
                                    {item.expediente}
                                </Link>
                                <span className={`badge ${getEstadoClasses(item.estado)} border-none py-2 px-3 text-xs`}>
                                    <i className={`fas ${getEstadoIcon(item.estado)} mr-1`}></i>
                                    {item.estado}
                                </span>
                            </div>

                            {/* Tipo de solicitud */}
                            <div className="mb-2">
                                <p className="text-xs text-gray-500">{item.nombreSolicitud}</p>
                                <p className="text-sm font-semibold text-gray-800">{item.descripcionSolicitud}</p>
                            </div>

                            {/* Contrayentes */}
                            {item.participantes && item.participantes.length > 0 && (
                                <div className="mb-2 space-y-1">
                                    {item.participantes
                                        .filter(p => p.rol.toLowerCase().includes('contrayente') || p.rol.toLowerCase().includes('divorciado'))
                                        .map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700 font-medium truncate mr-2">{p.nombre}</span>
                                                <span className="text-gray-500 text-xs font-mono shrink-0">
                                                    {p.tipo_identificacion}: {p.numero_identificacion}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Footer: fecha, precio y acciones */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <i className="far fa-calendar-alt text-indigo-400"></i>
                                        {formatearFechaHora(item.fecha)}
                                    </span>
                                    <span className="font-semibold text-green-600 text-sm">
                                        {formatearPrecio(item.precio)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => navigate('/dashboard/solicitud/detalles', { state: { id: item.id } })}
                                        className="btn btn-sm btn-circle btn-ghost text-indigo-600 hover:bg-indigo-100"
                                        title="Ver detalles"
                                    >
                                        <i className="fas fa-eye text-sm"></i>
                                    </button>
                                    {!['cancelado', 'anulada', 'completada'].includes(item.estado.toLowerCase()) && (
                                        <button
                                            onClick={() => navigate('/dashboard/actualizar', { state: { id: item.id } })}
                                            className="btn btn-sm btn-circle btn-ghost text-amber-600 hover:bg-amber-100"
                                            title="Editar solicitud"
                                        >
                                            <i className="fas fa-pen-to-square text-sm"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vista desktop - Tabla */}
                <div className="hidden lg:block">
                    <table className="w-full min-w-250">
                        <thead className="bg-info-content text-white">
                            <tr>
                                <th className="px-2 py-3 text-center text-sm font-semibold">Expediente</th>
                                <th className="px-2 py-3 w-40 text-center text-sm font-semibold">Tipo de Solicitud</th>
                                <th className="px-2 py-3 w-40 text-center text-sm font-semibold">Nombres</th>
                                <th className="px-2 py-3 text-center text-sm font-semibold">Documento</th>
                                <th className="px-2 py-3 text-center text-sm font-semibold">Fecha Trámite</th>
                                <th className="px-2 py-3 text-center text-sm font-semibold">Estado</th>
                                <th className="px-2 py-3 text-center text-sm font-semibold">Precio</th>
                                <th className="px-2 py-3 text-center text-sm font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={"divide-y divide-gray-100"}>
                            {data.map((item, index) => (
                                <tr key={`${item.id}-${index}`} className="hover:bg-green-100/50 hover:shadow-lg hover:shadow-indigo-200/50 hover:scale-101 hover:z-10 relative transition-all duration-200 border-b border-b-gray-300">
                                    <td className="px-3 py-3 text-md font-mono font-bold ">
                                        <Link to="/dashboard/solicitud/detalles" state={{ id: item.id }}>
                                            {item.expediente}
                                        </Link>
                                    </td>
                                    <td className={"py-3"}>
                                        <div>
                                            <p className="text-xs text-gray-500">{item.nombreSolicitud}</p>
                                            <p className="text-sm font-semibold text-gray-800">{item.descripcionSolicitud}</p>
                                        </div>
                                    </td>

                                    <td className="px-3 py-2">
                                        <div className="flex flex-col gap-2">
                                            {item.participantes && item.participantes.length > 0 ? (
                                                item.participantes
                                                    .filter(p => p.rol.toLowerCase().includes('contrayente') || p.rol.toLowerCase().includes('divorciado'))
                                                    .map((p, idx) => (
                                                        <span key={idx} className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                                                            {p.nombre}
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">No registrados</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-2">
                                        <div className="flex flex-col items-center gap-2">
                                            {item.participantes && item.participantes.length > 0 ? (
                                                item.participantes
                                                    .filter(p => p.rol.toLowerCase().includes('contrayente') || p.rol.toLowerCase().includes('divorciado'))
                                                    .map((p, idx) => (
                                                        <span key={idx} className="text-sm font-semibold text-indigo-600 font-mono whitespace-nowrap bg-indigo-50 px-2 py-0.5 rounded">
                                                            {p.tipo_identificacion}: {p.numero_identificacion}
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">—</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="text-md text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <i className="far fa-calendar-alt text-indigo-400"></i>
                                            {formatearFechaHora(item.fecha)}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge ${getEstadoClasses(item.estado)} border-none rounded-full py-3 px-2 font-semibold`}>
                                            <i className={`fas ${getEstadoIcon(item.estado)}`}></i>
                                            {item.estado}
                                        </span>
                                    </td>
                                    <td className="pl-2 text-center">
                                        <span className="font-semibold text-green-600">
                                            {formatearPrecio(item.precio)}
                                        </span>
                                    </td>
                                    <td className="px-2">
                                        <div className="flex items-center justify-center gap-2">
                                            {!['cancelado', 'anulada', 'completada'].includes(item.estado.toLowerCase()) && (
                                                <button
                                                    onClick={() => navigate('/dashboard/actualizar', { state: { id: item.id } })}
                                                    className="btn btn-sm btn-circle btn-ghost text-amber-600 hover:bg-amber-100 transition-colors"
                                                    title="Editar solicitud"
                                                >
                                                    <i className="fas fa-pen-to-square"></i>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate('/dashboard/solicitud/detalles', { state: { id: item.id } })}
                                                className="btn btn-sm btn-circle btn-ghost text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                title="Ver detalles"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}