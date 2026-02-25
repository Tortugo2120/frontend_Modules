type Solicitud = {
    expediente: string;
    tipo: string;
    solicitante: string;
    estado: 'Pendiente' | 'Completado' | 'En Proceso' | 'Observado';
    fecha: string;
}

type RecentReqProps = {
    solicitudes: Solicitud[];
    loading?: boolean;
}

export default function RecentReq({ solicitudes, loading = false }: RecentReqProps) {
    const formatFecha = (fecha: string) => {
        const solo = fecha?.split(' ')[0] ?? fecha;
        const [y, m, d] = solo.split('-');
        return `${d}/${m}/${y}`;
    };

    const getEstadoClasses = (estado: string) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-amber-100 text-amber-700';
            case 'Completado':
                return 'bg-green-100 text-green-700';
            case 'En Proceso':
                return 'bg-blue-100 text-blue-700';
            case 'Observado':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="xl:col-span-8 bg-white rounded-md shadow-lg">
            <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Solicitudes Recientes</h3>
            </div>
            <div className="p-4 lg:p-6 overflow-x-auto">
                <table className="w-full min-w-auto">
                    <thead>
                        <tr className="text-left text-gray-500 text-xs lg:text-sm font-medium uppercase tracking-wide">
                            <th className="pb-4">N° Expediente</th>
                            <th className="pb-4">Tipo</th>
                            <th className="pb-4">Solicitante</th>
                            <th className="pb-4">Estado</th>
                            <th className="pb-4">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                    {Array.from({ length: 5 }).map((__, j) => (
                                        <td key={j} className="py-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : solicitudes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                                    No hay solicitudes recientes
                                </td>
                            </tr>
                        ) : (
                            solicitudes.map((solicitud, index) => (
                                <tr key={index} className="border-t border-gray-100">
                                    <td className="py-4 font-medium text-gray-800">{solicitud.expediente}</td>
                                    <td className="py-4 text-gray-600 font-normal">{solicitud.tipo}</td>
                                    <td className="py-4 text-gray-600 font-normal">{solicitud.solicitante}</td>
                                    <td className="py-4">
                                        <span className={`${getEstadoClasses(solicitud.estado)} px-3 py-1 text-xs font-medium`}>
                                            {solicitud.estado}
                                        </span>
                                    </td>
                                    <td className="py-4 text-gray-500 font-normal">{formatFecha(solicitud.fecha)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}