import { useState, useCallback, useEffect } from 'react';
import {useGetRequirements} from "../../../../hooks/useGetRequeriments.ts";
import {useApplicationContext} from "../../../../context/ApplicationContext.tsx";

interface Requisito {
    id: string;
    titulo: string;
    descripcion: string;
    obligatorio: boolean;
    completado: boolean;
}

interface ArchivoSubido {
    id: string;
    nombre: string;
    tamaño: number;
    tipo: string;
    archivo: File;
}

interface RequisitosMatrimonioProps {
    tipoSolicitudNombre?: string;
    onRequisitosChange?: (requisitos: Requisito[]) => void;
    onArchivosChange?: (archivos: ArchivoSubido[]) => void;
}

const REQUISITOS_INICIALES: Requisito[] = [
    {
        id: '1',
        titulo: 'Partidas de Nacimiento de los Contrayentes.',
        descripcion: 'Original y copia certificada de la partida de nacimiento de ambos contrayentes (vigencia de 3 meses)',
        obligatorio: true,
        completado: false
    },
    {
        id: '2',
        titulo: 'Copias ampliadas al 150% y fedateadas de los contrayentes.',
        descripcion: 'Documento Nacional de Identidad vigente de ambos contrayentes (original y copia)',
        obligatorio: true,
        completado: false
    },
    {
        id: '3',
        titulo: 'Copias ampliadas al 150% y fedateadas de los Testigos.',
        descripcion: 'Estos deben declarar que conocen a los contrayentes como máximo 3 años',
        obligatorio: true,
        completado: false
    },
    {
        id: '4',
        titulo: 'Certificado de Soltería',
        descripcion: 'Expedida por la municipalidad donde nació o RENIEC',
        obligatorio: true,
        completado: false
    },
    {
        id: '5',
        titulo: 'Análisis Clínico',
        descripcion: 'Certificando el Grupo sanguineo y prueba de VIH',
        obligatorio: true,
        completado: false
    },
    {
        id: '6',
        titulo: 'Publicación de edicto Matrimonial',
        descripcion: 'La publicación debe realizarse 15 días antes de la fecha.',
        obligatorio: true,
        completado: false
    },
];

const RequisitosMatrimonio = ({
    tipoSolicitudNombre,
    onRequisitosChange,
    onArchivosChange
}: RequisitosMatrimonioProps) => {
    const [requisitos, setRequisitos] = useState<Requisito[]>(REQUISITOS_INICIALES);
    const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [requisitosEstados, setRequisitosEstados] = useState<Map<number, boolean>>(new Map());
    const {formDataAplication, updateRequisitos} = useApplicationContext();
    const {requirements,fetchRequirements} = useGetRequirements();

    // Cargar requisitos guardados desde el contexto al iniciar
    useEffect(() => {
        if (formDataAplication.requisitos && formDataAplication.requisitos.length > 0) {
            const newMap = new Map(
                formDataAplication.requisitos.map(r => {
                    // Convertir ID a número si es string
                    const idNum = typeof r.requirementId === 'string' ? parseInt(r.requirementId) : r.requirementId;
                    return [idNum, r.delivered];
                })
            );
            setRequisitosEstados(newMap);
        }
    }, []);

    useEffect(() => {
        if (requirements.length === 0) return;
        const requisitosArray = requirements.map(req => {
            const reqId = typeof req.id === 'string' ? parseInt(req.id) : req.id;
            return {
                requirementId: req.id, // Mantener el ID original (puede ser string o number)
                delivered: requisitosEstados.get(reqId) ?? false
            };
        });

        console.log('Sincronizando requisitos:', requisitosArray);
        updateRequisitos(requisitosArray);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requisitosEstados, requirements]);

    // Notificar cambios en requisitos
    useEffect(() => {
        if (onRequisitosChange) {
            onRequisitosChange(requisitos);
        }
    }, [requisitos, onRequisitosChange]);

    // Notificar cambios en archivos
    useEffect(() => {
        if (onArchivosChange) {
            onArchivosChange(archivos);
        }
    }, [archivos, onArchivosChange]);

    useEffect(() => {
        const obtenerCondiciones = () => {
            const conds = new Set<string>(["GENERAL"]);

            formDataAplication.participants.forEach((p) => {
                if (p.maritalStatus && p.maritalStatus !== "Single") {
                    conds.add(p.maritalStatus.toUpperCase());
                }
            });
            return Array.from(conds).join(',');
        }

        const cargarRequeriments = async ()=>{
            const applicationTypeId = formDataAplication.application.applicationTypeId;
            const condition = obtenerCondiciones();
            console.log("Llamando a requisitos con:", { applicationTypeId, condition });
            await fetchRequirements(applicationTypeId, condition);
        }
        if (formDataAplication.application.applicationTypeId > 0) {
            cargarRequeriments();
        }
    }, [formDataAplication.application.applicationTypeId]);

    const calcularProgreso = useCallback(() => {
        const listaRequisitos = requirements.length > 0 ? requirements : requisitos;
        const total = listaRequisitos.length;
        const completados = requirements.length > 0
            ? Array.from(requisitosEstados.values()).filter(estado => estado).length
            : requisitos.filter(r => r.completado).length;

        return {
            completados,
            total,
            porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0
        };
    }, [requisitos, requirements, requisitosEstados]);

    const progreso = calcularProgreso();

    // Manejar cambio de checkbox
    const handleCheckboxChange = useCallback((id: string | number) => {
        if (requirements.length > 0) {
            // Usar requirements del hook
            const numId = typeof id === 'string' ? parseInt(id) : id;

            setRequisitosEstados(prev => {
                const newMap = new Map(prev);
                // Obtener el estado actual, si no existe, usar false
                const estadoActual = newMap.get(numId) ?? false;
                const nuevoEstado = !estadoActual;

                // Toggle entre true y false
                newMap.set(numId, nuevoEstado);

                console.log(`Checkbox ${numId}: ${estadoActual} -> ${nuevoEstado}`);

                return newMap;
            });
        } else {
            // Usar requisitos locales
            setRequisitos(prev =>
                prev.map(req =>
                    req.id === id
                        ? { ...req, completado: !req.completado }
                        : req
                )
            );
        }
    }, [requirements]);

    const marcarTodosObligatorios = useCallback(() => {
        if (requirements.length > 0) {
            // Marcar todos los requirements del hook como true
            setRequisitosEstados(prev => {
                const newMap = new Map(prev);
                requirements.forEach(req => {
                    const reqId = typeof req.id === 'string' ? parseInt(req.id) : req.id;
                    newMap.set(reqId, true);
                });
                return newMap;
            });
        } else {
            setRequisitos(prev =>
                prev.map(req =>
                    req.obligatorio
                        ? { ...req, completado: true }
                        : req
                )
            );
        }
    }, [requirements]);

    // Desmarcar todos
    const desmarcarTodos = useCallback(() => {
        if (requirements.length > 0) {
            setRequisitosEstados(prev => {
                const newMap = new Map(prev);
                requirements.forEach(req => {

                    const reqId = typeof req.id === 'string' ? parseInt(req.id) : req.id;
                    newMap.set(reqId, false);
                });
                return newMap;
            });
        } else {

            setRequisitos(prev =>
                prev.map(req => ({ ...req, completado: false }))
            );
        }
    }, [requirements]);

    const formatearTamaño = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const nuevosArchivos: ArchivoSubido[] = Array.from(files).map(file => ({
            id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            nombre: file.name,
            tamaño: file.size,
            tipo: file.type,
            archivo: file
        }));

        setArchivos(prev => [...prev, ...nuevosArchivos]);
        e.target.value = ''; // Resetear input
    }, []);

    const handleEliminarArchivo = useCallback((id: string) => {
        setArchivos(prev => prev.filter(a => a.id !== id));
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;

        const nuevosArchivos: ArchivoSubido[] = Array.from(files).map(file => ({
            id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            nombre: file.name,
            tamaño: file.size,
            tipo: file.type,
            archivo: file
        }));

        setArchivos(prev => [...prev, ...nuevosArchivos]);
    }, []);

    const getIconoArchivo = (tipo: string): string => {
        if (tipo.includes('pdf')) return 'fa-file-pdf text-red-500';
        if (tipo.includes('image')) return 'fa-file-image text-blue-500';
        if (tipo.includes('word') || tipo.includes('document')) return 'fa-file-word text-blue-600';
        if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'fa-file-excel text-green-600';
        return 'fa-file text-gray-500';
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-clipboard-check text-blue-600"></i>
                    <span>Requisitos para el Matrimonio</span>
                </h3>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center w-fit">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Barra de Progreso */}
            <div className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            Progreso de Requisitos Obligatorios
                        </h4>
                        <p className="text-xs text-gray-600">
                            {progreso.completados} de {progreso.total} requisitos completados
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl sm:text-3xl font-bold ${
                            progreso.porcentaje === 100 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                            {progreso.porcentaje}%
                        </span>
                        {progreso.porcentaje === 100 && (
                            <i className="fas fa-check-circle text-green-600 text-xl"></i>
                        )}
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            progreso.porcentaje === 100
                                ? 'bg-linear-to-r from-green-500 to-green-600'
                                : 'bg-linear-to-r from-blue-500 to-purple-600'
                        }`}
                        style={{ width: `${progreso.porcentaje}%` }}
                    ></div>
                </div>
            </div>

            {/* Botones de Acción Rápida */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={marcarTodosObligatorios}
                    className="w-full sm:w-auto px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-check-double"></i>
                    <span>Marcar Obligatorios</span>
                </button>
                <button
                    type="button"
                    onClick={desmarcarTodos}
                    className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-times-circle"></i>
                    <span>Desmarcar Todos</span>
                </button>
            </div>

            {/* Lista de Requisitos */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <i className="fas fa-list-check text-blue-600"></i>
                    Lista de Requisitos
                </h4>
                
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {(requirements.length > 0 ? requirements : requisitos).map((requisito, index) => {
                        // Convertir el ID a número si es string para buscar en el Map
                        const requistoIdNum = typeof requisito.id === 'string' ? parseInt(requisito.id) : requisito.id;

                        // Determinar si está completado según el tipo de data
                        const estadoEnMap = requisitosEstados.get(requistoIdNum);
                        const isCompleted = requirements.length > 0
                            ? Boolean(estadoEnMap)
                            : (requisito as Requisito).completado;

                        // Debug log
                        if (requirements.length > 0 && index === 0) {
                            console.log('Renderizando requisitos. Map size:', requisitosEstados.size);
                            console.log('Primer requisito - ID:', requisito.id, 'Tipo:', typeof requisito.id, 'ID convertido:', requistoIdNum);
                            console.log('Estado en Map:', estadoEnMap, 'isCompleted:', isCompleted);
                        }

                        // Adaptar propiedades según el tipo de data
                        const titulo = requirements.length > 0
                            ? (requisito as any).nombre_requisito
                            : (requisito as Requisito).titulo;
                        const descripcion = requirements.length > 0
                            ? (requisito as any).descripcion
                            : (requisito as Requisito).descripcion;
                        const id = requisito.id;

                        return (
                            <div
                                key={id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${
                                    isCompleted ? 'bg-green-50' : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox */}
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            type="checkbox"
                                            id={`requisito-${id}`}
                                            checked={isCompleted}
                                            onChange={() => handleCheckboxChange(id)}
                                            className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                        />
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <label
                                            htmlFor={`requisito-${id}`}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <span className={`text-sm font-medium ${
                                                    isCompleted
                                                        ? 'text-gray-500 line-through'
                                                        : 'text-gray-900'
                                                }`}>
                                                    {index + 1}. {titulo}
                                                </span>
                                                {/* Para requirements del hook, todos son obligatorios */}
                                                {requirements.length > 0 ? (
                                                    <span className="shrink-0 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                                                        Obligatorio
                                                    </span>
                                                ) : (
                                                    <>
                                                        {(requisito as Requisito).obligatorio && (
                                                            <span className="shrink-0 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                                                                Obligatorio
                                                            </span>
                                                        )}
                                                        {!(requisito as Requisito).obligatorio && (
                                                            <span className="shrink-0 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded">
                                                                Opcional
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <p className={`text-xs ${
                                                isCompleted ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {descripcion}
                                            </p>
                                        </label>
                                    </div>

                                    {/* Estado */}
                                    {isCompleted && (
                                        <div className="shrink-0">
                                            <i className="fas fa-check-circle text-green-600 text-xl"></i>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sección de Carga de Archivos (Opcional) */}
            <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <i className="fas fa-cloud-upload-alt text-purple-600"></i>
                        Documentos Adjuntos
                        <span className="text-xs font-normal text-gray-500">(Opcional)</span>
                    </h4>
                    {archivos.length > 0 && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {archivos.length} archivo{archivos.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Zona de Drop */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
                        isDragging
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                    <i className={`fas fa-cloud-upload-alt text-4xl sm:text-5xl mb-3 ${
                        isDragging ? 'text-purple-600' : 'text-gray-400'
                    }`}></i>
                    <p className="text-sm sm:text-base font-medium text-gray-700 mb-2">
                        {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                        Formatos permitidos: PDF, Word, Excel, Imágenes (máx. 10MB por archivo)
                    </p>
                    <label className="inline-block">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                        />
                        <span className="cursor-pointer inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                            <i className="fas fa-folder-open"></i>
                            Seleccionar Archivos
                        </span>
                    </label>
                </div>

                {/* Lista de Archivos Subidos */}
                {archivos.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                        {archivos.map((archivo) => (
                            <div
                                key={archivo.id}
                                className="p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="shrink-0">
                                    <i className={`fas ${getIconoArchivo(archivo.tipo)} text-2xl`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {archivo.nombre}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatearTamaño(archivo.tamaño)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleEliminarArchivo(archivo.id)}
                                    className="shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar archivo"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mensaje Informativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <div className="shrink-0">
                    <i className="fas fa-info-circle text-blue-600 text-xl"></i>
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                    <p className="font-semibold mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>LA PROGRAMACIÓN DE MATRIMINIO SE REALIZA CON UN MES DE ANTICIPACIÓN.</li>
                        <li>Los requisitos marcados como <strong>Obligatorios</strong> deben ser completados para proceder.</li>
                        <li>Los documentos adjuntos son opcionales pero recomendados para agilizar el proceso.</li>
                        <li>Asegúrese de que todos los documentos estén vigentes y sean legibles.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RequisitosMatrimonio;