import { useState, useEffect, useRef } from "react";
import type { RequirementByApplication } from "../../../model/requerimentsModel.ts";

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
    nombresPersonas?: Map<string, string>;
}

export const RequirementsDisplay = ({ requirements, onRequirementsChange, nombresPersonas }: RequirementsDisplayProps) => {

    const [checkedIds, setCheckedIds] = useState<Set<string | number>>(new Set());
    const [archivos, setArchivos] = useState<Map<string | number, ArchivoRequisito>>(new Map());
    const [observaciones, setObservaciones] = useState<Map<string | number, string>>(new Map());

    // Usar useRef para mantener la referencia actualizada de la funciÃ³n
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

    // Agrupar requisitos por contrayente (numero_documento)
    const groupedByDocument = new Map<string, RequirementByApplication[]>();
    for (const req of safeRequirements) {
        const key = req.numero_documento || 'general';
        if (!groupedByDocument.has(key)) groupedByDocument.set(key, []);
        groupedByDocument.get(key)!.push(req);
    }
    const generalGroup = groupedByDocument.get('general') ?? [];
    const contrayenteGroups = Array.from(groupedByDocument.entries()).filter(([key]) => key !== 'general');

    const getNombreContrayente = (docNum: string): string => {
        if (docNum === 'general') return 'General';
        return nombresPersonas?.get(docNum) || docNum;
    };

    const renderColumna = (docNum: string, reqs: RequirementByApplication[]) => {
        const nombre = getNombreContrayente(docNum);
        const entregadosCol = reqs.filter(r => r.entregado === 1).length;
        const pendientesCol = reqs.filter(r => r.entregado === 0).length;
        const isGeneral = docNum === 'general';

        return (
            <div key={docNum} className="flex flex-col rounded-md border border-gray-200 overflow-hidden shadow-sm">
                {/* Cabecera de columna */}
                <div className={`px-4 py-3 flex items-center justify-between gap-2 ${isGeneral ? 'bg-info-content' : 'bg-info-content'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                        <i className={`fas ${isGeneral ? 'fa-layer-group' : 'fa-user'} text-white text-sm shrink-0`}></i>
                        <span className="text-white font-semibold text-sm truncate" title={nombre}>
                            {nombre}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="badge badge-success badge-sm gap-1">
                            <i className="fas fa-check text-xs"></i>
                            {entregadosCol}
                        </span>
                        <span className="badge badge-warning badge-sm gap-1">
                            <i className="fas fa-clock text-xs"></i>
                            {pendientesCol}
                        </span>
                    </div>
                </div>

                {/* Lista de requisitos */}
                <div className="flex flex-col divide-y divide-gray-100 bg-white">
                    {reqs.map((requisito) => {
                        const isEntregado = requisito.entregado === 1;
                        const isChecked = checkedIds.has(requisito.id);
                        const archivo = archivos.get(requisito.id);

                        return (
                            <div
                                key={requisito.id}
                                className={`p-3 transition-all ${
                                    isEntregado
                                        ? 'bg-green-50/60'
                                        : isChecked
                                            ? 'bg-blue-50/50'
                                            : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                {/* Fila: nombre + badge estado */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 min-w-0">
                                        {isEntregado ? (
                                            <i className="fas fa-check-circle text-green-500 text-base mt-0.5 shrink-0"></i>
                                        ) : (
                                            <i className="fas fa-circle-notch text-yellow-500 text-base mt-0.5 shrink-0"></i>
                                        )}
                                        <span className="text-sm font-medium text-gray-800 leading-snug">
                                            {requisito.nombre_requisito}
                                        </span>
                                    </div>
                                    {isEntregado ? (
                                        <span className="badge badge-success badge-sm shrink-0">
                                            <i className="fa-regular fa-square-check mr-1 text-xs"></i>
                                            Entregado
                                        </span>
                                    ) : isChecked ? (
                                        <span className="badge badge-info badge-sm shrink-0">
                                            <i className="fas fa-check mr-1 text-xs"></i>
                                            Por entregar
                                        </span>
                                    ) : (
                                        <span className="badge badge-warning badge-sm shrink-0">
                                            <i className="fas fa-clock mr-1 text-xs"></i>
                                            Pendiente
                                        </span>
                                    )}
                                </div>

                                {/* Detalles extra: fecha / observación */}
                                <div className="mt-1 ml-6 space-y-0.5 text-xs text-gray-500">
                                    {isEntregado ? (
                                        <>
                                            <p><span className="font-medium">Entregado:</span> {formatearFecha(requisito.fecha_entrega)}</p>
                                            {requisito.observacion && requisito.observacion.trim() !== "" && (
                                                <p><span className="font-medium">Obs.:</span> {requisito.observacion}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p><span className="font-medium">Actualizado:</span> {formatearFecha(requisito.fecha_entrega)}</p>
                                    )}
                                </div>

                                {/* Pendientes*/}
                                {!isEntregado && (
                                    <div className="mt-2 ml-6 space-y-2">
                                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(requisito.id)}
                                                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                            />
                                            <span className="text-xs font-medium text-gray-600">Marcar como entregado</span>
                                        </label>

                                        {isChecked && (
                                            <div className="space-y-2 pt-2 border-t border-blue-100">
                                                {!archivo ? (
                                                    <label className="cursor-pointer flex items-center gap-1.5 w-fit">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                                                            onChange={(e) => handleFileChange(requisito.id, e)}
                                                        />
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                            <i className="fas fa-paperclip"></i>
                                                            Adjuntar documento
                                                        </span>
                                                        <span className="text-xs text-gray-400">opcional &lt;5MB</span>
                                                    </label>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-white rounded-lg border border-blue-200 px-3 py-1.5">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <i className="fas fa-file text-blue-500 shrink-0 text-xs"></i>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-medium text-gray-900 truncate">{archivo.nombre}</p>
                                                                <p className="text-xs text-gray-400">{formatearTamaño(archivo.filesize)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-2 shrink-0">
                                                            <label className="cursor-pointer">
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
                                                                className="text-red-400 hover:text-red-600 text-xs"
                                                                title="Quitar archivo"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <textarea
                                                    value={observaciones.get(requisito.id) || ''}
                                                    onChange={(e) => handleObservacionChange(requisito.id, e.target.value)}
                                                    placeholder="Observación (opcional)..."
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs outline-none resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
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
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-linear-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
            </div>

            {/* EstadÃ­sticas */}
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

            {/* Requisitos generales â€” fila completa arriba */}
            {safeRequirements.length > 0 && generalGroup.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Requisitos Generales</h4>
                    {renderColumna('general', generalGroup)}
                </div>
            )}

            {/* Requisitos por contrayente â€” 2 columnas abajo */}
            {safeRequirements.length > 0 && contrayenteGroups.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Requisitos por Contrayente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                        {contrayenteGroups.map(([docNum, reqs]) => renderColumna(docNum, reqs))}
                    </div>
                </div>
            )}

            {/* Estado vacÃ­o */}
            {safeRequirements.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 font-medium">No hay requerimientos disponibles</p>
                </div>
            )}
        </div>
    );
};
