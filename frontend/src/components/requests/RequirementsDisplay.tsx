import { useState, useEffect, useRef } from "react";
import type { RequirementByApplication } from "../../model/requerimentsModel.ts";

interface ArchivoRequisito {
    nombre: string;
    filesize: number;
    file: File;
}

export interface RequirementUpdate {
    requirementId: number;
    delivered: number;
    observation: string | null;
    file?: File;
}

interface RequirementsDisplayProps {
    requirements: RequirementByApplication[];
    onRequirementsChange?: (updates: RequirementUpdate[]) => void;
}

export const RequirementsDisplay = ({ requirements, onRequirementsChange }: RequirementsDisplayProps) => {

    const [checkedIds, setCheckedIds] = useState<Set<string | number>>(new Set());
    const [archivos, setArchivos] = useState<Map<string | number, ArchivoRequisito>>(new Map());
    const [observaciones, setObservaciones] = useState<Map<string | number, string>>(new Map());

    // Usar useRef para mantener la referencia actualizada de la función
    const onRequirementsChangeRef = useRef(onRequirementsChange);

    useEffect(() => {
        onRequirementsChangeRef.current = onRequirementsChange;
    }, [onRequirementsChange]);

    // Emitir cambios al padre cuando cambian los datos
    useEffect(() => {
        if (onRequirementsChangeRef.current) {
            const updates: RequirementUpdate[] = Array.from(checkedIds).map(id => {
                const requirement = requirements.find(r => r.id === id);
                const archivo = archivos.get(id);
                const observacion = observaciones.get(id) || null;

                return {
                    requirementId: requirement?.id_requisito ? Number(requirement.id_requisito) : Number(id),
                    delivered: 1,
                    observation: observacion,
                    file: archivo?.file
                };
            });

            onRequirementsChangeRef.current(updates);
        }
    }, [checkedIds, archivos, observaciones, requirements]);

    const handleCheckboxChange = (id: string | number) => {
        setCheckedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                setArchivos(prevArchivos => {
                    const nextArchivos = new Map(prevArchivos);
                    nextArchivos.delete(id);
                    return nextArchivos;
                });
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleFileChange = (id: string | number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setArchivos(prev => {
            const next = new Map(prev);
            next.set(id, { nombre: file.name, filesize: file.size, file });
            return next;
        });
    };

    const handleObservacionChange = (id: string | number, value: string) => {
        setObservaciones(prev => {
            const next = new Map(prev);
            next.set(id, value);
            return next;
        });
    };

    const formatearTamaño = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const safeRequirements = Array.isArray(requirements) ? requirements : [];

    const completados = safeRequirements.filter(r => r && r.entregado === 1);
    const pendientes = safeRequirements.filter(r => r && r.entregado === 0);

    // Total completados = los del backend + los pendientes marcados por el usuario
    const totalCompletados = completados.length + checkedIds.size;

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
        return Math.round((totalCompletados / safeRequirements.length) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Resumen del progreso */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Resumen de Entregas</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalCompletados} de {safeRequirements.length} requerimientos completados
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
                        className="bg-linear-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300"
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
                    <div className="flex justify-between gap-2">
                        <div className="flex flex-row items-center">
                            <i className="fas fa-hourglass text-yellow-600 text-lg"></i>
                            <h4 className="text-lg font-semibold text-gray-900">
                                Requerimientos Pendientes ({pendientes.length})
                            </h4>
                        </div>
                        <span className="badge badge-warning gap-2 shrink-0 mr-4">
                            <i className="fas fa-clock text-sm"></i>
                            Pendientes
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pendientes.map((requisito) => {
                            const isChecked = checkedIds.has(requisito.id);
                            const archivo = archivos.get(requisito.id);
                            return (
                                <div
                                    key={requisito.id}
                                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all ${isChecked ? "border-blue-300 bg-blue-50/30" : "border-yellow-200"}`}
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

                                        {/* Checkbox de entregado */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <span className="text-sm font-medium text-gray-600">¿Entregado?</span>
                                                <input
                                                    type="checkbox"
                                                    id={`requisito-${requisito.id}`}
                                                    checked={isChecked}
                                                    onChange={() => handleCheckboxChange(requisito.id)}
                                                    className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Sección de adjunto — visible solo si checkbox está activo */}
                                    {isChecked && (
                                        <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                                            {!archivo ? (
                                                <label className="cursor-pointer flex items-center gap-2 w-fit">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png,.docx"
                                                        onChange={(e) => handleFileChange(requisito.id, e)}
                                                    />
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                        <i className="fas fa-paperclip"></i>
                                                        Adjuntar documento (Opcional)
                                                    </span>
                                                    <span className="text-xs text-gray-500">PDF, JPG, PNG, DOCX</span>
                                                    <span className='text-xs font-black text-red-800'>
                                                        opcional*
                                                    </span>
                                                </label>
                                            ) : (
                                                <div className="flex items-center justify-between bg-white rounded-lg border border-blue-200 px-4 py-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <i className="fas fa-file text-blue-500 shrink-0"></i>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{archivo.nombre}</p>
                                                            <p className="text-xs text-gray-500">{formatearTamaño(archivo.filesize)}</p>
                                                        </div>
                                                    </div>
                                                    <label className="ml-3 cursor-pointer shrink-0">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                                                            onChange={(e) => handleFileChange(requisito.id, e)}
                                                        />
                                                        <span className="text-xs text-blue-600 hover:underline">Cambiar</span>
                                                    </label>
                                                    <button
                                                        onClick={() => setArchivos(prev => { const n = new Map(prev); n.delete(requisito.id); return n; })}
                                                        className="ml-2 text-red-400 hover:text-red-600 text-xs shrink-0"
                                                        title="Quitar archivo"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Campo de observación */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Observación (Opcional)
                                                </label>
                                                <textarea
                                                    value={observaciones.get(requisito.id) || ''}
                                                    onChange={(e) => handleObservacionChange(requisito.id, e.target.value)}
                                                    placeholder="Agregar una observación sobre este requerimiento..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
