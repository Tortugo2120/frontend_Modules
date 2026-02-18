import type { RequirementByApplication } from "../../model/requerimentsModel.ts";

interface RequirementsDisplayProps {
    requirements: RequirementByApplication[];
}

export const RequirementsDisplay = ({ requirements }: RequirementsDisplayProps) => {

    const safeRequirements = Array.isArray(requirements) ? requirements : [];

    const completados = safeRequirements.filter(r => r && r.entregado === 1);
    const pendientes = safeRequirements.filter(r => r && r.entregado === 0);

    const formatearFecha = (fecha: string): string => {
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    const getProgressPercentage = (): number => {
        if (safeRequirements.length === 0) return 0;
        return Math.round((completados.length / safeRequirements.length) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Resumen del progreso */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Resumen de Entregas</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {completados.length} de {safeRequirements.length} requerimientos completados
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">
                            {getProgressPercentage()}%
                        </div>
                        <p className="text-xs text-gray-600">Progreso</p>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-linear-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-check text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Completados</p>
                            <p className="text-2xl font-bold text-green-600">{completados.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-clock text-yellow-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pendientes</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendientes.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Requerimientos Completados */}
            {completados.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-600 text-lg"></i>
                        <h4 className="text-lg font-semibold text-gray-900">
                            Requerimientos Entregados ({completados.length})
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {completados.map((requisito) => (
                            <div
                                key={requisito.id}
                                className="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <i className="fas fa-check-circle text-green-500 text-lg mt-1"></i>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-gray-900">
                                                    {requisito.nombre_requisito}
                                                </h5>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                    <p>
                                                        <span className="font-medium">Fecha de entrega:</span> {formatearFecha(requisito.fecha_entrega)}
                                                    </p>
                                                    {requisito.observacion && requisito.observacion.trim() !== "" && (
                                                        <p>
                                                            <span className="font-medium">Observación:</span> {requisito.observacion}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="badge badge-success gap-2 shrink-0">
                                        <i className="fas fa-check text-sm"></i>
                                        Entregado
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Requerimientos Pendientes */}
            {pendientes.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-hourglass text-yellow-600 text-lg"></i>
                        <h4 className="text-lg font-semibold text-gray-900">
                            Requerimientos Pendientes ({pendientes.length})
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {pendientes.map((requisito) => (
                            <div
                                key={requisito.id}
                                className="bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <i className="fas fa-circle-notch text-yellow-500 text-lg mt-1"></i>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-gray-900">
                                                    {requisito.nombre_requisito}
                                                </h5>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                    <p>
                                                        <span className="font-medium">Última actualización:</span> {formatearFecha(requisito.fecha_entrega)}
                                                    </p>
                                                    {requisito.observacion && requisito.observacion.trim() !== "" && (
                                                        <p>
                                                            <span className="font-medium">Observación:</span> {requisito.observacion}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="badge badge-warning gap-2 shrink-0">
                                        <i className="fas fa-clock text-sm"></i>
                                        Pendiente
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estado vacío */}
            {safeRequirements.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 font-medium">No hay requerimientos disponibles</p>
                </div>
            )}
        </div>
    );
};
