import { useState, useCallback, useEffect } from 'react';
import {useGetRequirements} from "../../../../hooks/useGetRequeriments.ts";
import {useApplicationContext} from "../../../../context/ApplicationContext.tsx";
import {db} from "../../../../model/documentModel.ts";
import {useDocument} from "../../../../hooks/useDocument.ts";

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
    descriptionSolicitud?: string;
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
    descriptionSolicitud,
    onRequisitosChange,
    onArchivosChange
}: RequisitosMatrimonioProps) => {
    const [requisitos, setRequisitos] = useState<Requisito[]>(REQUISITOS_INICIALES);
    const [archivos] = useState<ArchivoSubido[]>([]);
    const [archivosRequisitos, setArchivosRequisitos] = useState<Map<number, ArchivoSubido[]>>(new Map());
    const [requisitosEstados, setRequisitosEstados] = useState<Map<number, number>>(new Map());
    const {formDataAplication, updateRequisitos} = useApplicationContext();
    const {requirements,fetchRequirements} = useGetRequirements();
    const {addDocument,deleteDocument} = useDocument();

    // Cargar requisitos guardados desde el contexto al iniciar
    useEffect(() => {
        if (formDataAplication.requirements && formDataAplication.requirements.length > 0) {
            const newMap = new Map(
                formDataAplication.requirements.map(r => {
                    // Convertir ID a número si es string
                    const idNum = typeof r.requirementId === 'string' ? parseInt(r.requirementId) : r.requirementId;
                    return [idNum, r.delivered];
                })
            );
            setRequisitosEstados(newMap);
        }
    }, []);

    // Cargar archivos guardados desde IndexedDB al iniciar
    useEffect(() => {
        const cargarArchivosGuardados = async () => {
            try {
                const todosLosDocumentos = await db.documents.toArray();
                const newMap = new Map<number, ArchivoSubido[]>();

                todosLosDocumentos.forEach(doc => {
                    if (doc.file) {
                        const archivo: ArchivoSubido = {
                            id: `${doc.requirementId}-${doc.file.name}`,
                            nombre: doc.nombreArchivo || doc.file.name,
                            tamaño: doc.file.size,
                            tipo: doc.file.type,
                            archivo: doc.file
                        };

                        const archivosExistentes = newMap.get(doc.requirementId) || [];
                        newMap.set(doc.requirementId, [...archivosExistentes, archivo]);
                    }
                });

                setArchivosRequisitos(newMap);
                console.log('Archivos cargados desde IndexedDB:', newMap);
            } catch (error) {
                console.error('Error al cargar archivos desde IndexedDB:', error);
            }
        };

        cargarArchivosGuardados();
    }, []);

    useEffect(() => {
        if (requirements.length === 0) return;
        const requisitosArray = requirements.map(req => {
            const reqId = typeof req.id === 'string' ? parseInt(req.id) : req.id;
            const estadoEntregado = requisitosEstados.get(reqId) ?? 0; // ✅ Devuelve number

            return {
                requirementId: reqId,
                delivered: estadoEntregado
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
                if (p.maritalStatus && p.maritalStatus !== "Single" && p.rol !== "testigo") {
                    conds.add(p.maritalStatus.toUpperCase());
                }
            });
            console.log("condiciones: ",conds);
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
            ? Array.from(requisitosEstados.values()).filter(estado => estado === 1).length
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
            const numId = typeof id === 'string' ? parseInt(id) : id;

            setRequisitosEstados(prev => {
                const newMap = new Map(prev);
                const estadoActual = newMap.get(numId) ?? 0;
                const nuevoEstado = estadoActual === 1 ? 0 : 1;

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
            setRequisitosEstados(prev => {
                const newMap = new Map(prev);
                requirements.forEach(req => {
                    const reqId = typeof req.id === 'string' ? parseInt(req.id) : req.id;
                    newMap.set(reqId, 1); // 1 = entregado
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
    const desmarcarTodos = useCallback(async () => {
        if (requirements.length > 0) {
            setRequisitosEstados(prev => {
                const newMap = new Map(prev);
                requirements.forEach(req => {

                    const reqId = typeof req.id === 'string' ? parseInt(req.id) : req.id;
                    newMap.set(reqId, 0);
                });
                return newMap;
            });

            // Limpiar todos los archivos de IndexedDB
            try {
                await db.documents.clear();
                console.log('Todos los archivos eliminados de IndexedDB');
            } catch (error) {
                console.error('Error al limpiar IndexedDB:', error);
            }

            // Limpiar todos los archivos de requisitos
            setArchivosRequisitos(new Map());
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

    // Manejar archivos específicos de requisito
    const handleRequisitoFileChange = useCallback(async (requisitoId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        const nuevoArchivo: ArchivoSubido = {
            id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            nombre: file.name,
            tamaño: file.size,
            tipo: file.type,
            archivo: file
        };
        try {
            await db.documents.where('requirementId').equals(requisitoId).delete();
            const docGuardado = await addDocument(
                {
                    requirementId:requisitoId,
                    file:nuevoArchivo.archivo,
                    nombreArchivo: nuevoArchivo.nombre
                }
            );
            console.log(`Archivo guardado en IndexedDB: ${docGuardado?.nombreArchivo} para requisito ${requisitoId}`);
        } catch (error) {
            console.error('Error al guardar archivos en IndexedDB:', error);
        }

        setArchivosRequisitos(prev => {
            const newMap = new Map(prev);
            newMap.set(requisitoId, [nuevoArchivo]);
            return newMap;
        });

        e.target.value = '';
    }, []);

    const handleEliminarArchivoRequisito = useCallback(async (requisitoId: number) => {
        try {
            await deleteDocument(requisitoId);
            console.log(`Archivo eliminado de IndexedDB para requisito ${requisitoId}`);
        } catch (error) {
            console.error('Error al eliminar archivo de IndexedDB:', error);
        }
        
        setArchivosRequisitos(prev => {
            const newMap = new Map(prev);
            newMap.delete(requisitoId);
            return newMap;
        });
    }, []);

    const getIconoArchivo = (tipo: string): string => {
        if (tipo.includes('pdf')) return 'fa-file-pdf text-red-500';
        if (tipo.includes('image')) return 'fa-file-image text-blue-500';
        if (tipo.includes('word') || tipo.includes('document')) return 'fa-file-word text-blue-600';
        if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'fa-file-excel text-green-600';
        return 'fa-file text-gray-500';
    };

    const getNombreCondicion = (condicion: string): string => {
        const nombres: { [key: string]: string } = {
            'GENERAL': 'Requisitos Generales',
            'DIVORCED': 'Requisitos para Divorciados',
            'WIDOWED': 'Requisitos para Viudos'
        };
        return nombres[condicion] || condicion;
    };

    const getIconoCondicion = (condicion: string): string => {
        const iconos: { [key: string]: string } = {
            'GENERAL': 'fa-clipboard-list',
            'DIVORCED': 'fa-user-slash',
            'WIDOWED': 'fa-heart-broken'
        };
        return iconos[condicion] || 'fa-file-alt';
    };

    const getColorCondicion = (condicion: string): string => {
        const colores: { [key: string]: string } = {
            'GENERAL': 'blue',
            'DIVORCED': 'orange',
            'WIDOWED': 'purple'
        };
        return colores[condicion] || 'gray';
    };

    // Agrupar requisitos por condición
    const requisitosAgrupados = () => {
        const grupos: { [key: string]: typeof requirements } = {};

        requirements.forEach(req => {
            const condicion = req.condicion || 'GENERAL';
            if (!grupos[condicion]) {
                grupos[condicion] = [];
            }
            grupos[condicion].push(req);
        });

        return grupos;
    };

    const grupos = requisitosAgrupados();

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-clipboard-check text-blue-600"></i>
                    <span>Requisitos para el Matrimonio</span>
                </h3>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex flex-col items-center w-fit">
                        <div>
                            <i className="fas fa-file-alt mr-2"></i>
                            {tipoSolicitudNombre.toUpperCase()}
                        </div>
                        <span className='text-xs'>
                            {descriptionSolicitud}
                        </span>
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
                        <span className={`text-2xl sm:text-3xl font-bold ${progreso.porcentaje === 100 ? 'text-green-600' : 'text-blue-600'
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
                        className={`h-full rounded-full transition-all duration-500 ${progreso.porcentaje === 100
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
                    <span>Marcar Todos</span>
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

            {/* Lista de Requisitos por Condición */}
            <div className="space-y-6">
                {Object.entries(grupos).map(([condicion, requisitosGrupo]) => {
                    const color = getColorCondicion(condicion);

                    return (
                        <div key={condicion} className="space-y-3">
                            {/* Header de la Sección */}
                            <div className={`flex items-center gap-2 pb-2`}>
                                <i className={`fas ${getIconoCondicion(condicion)} text-${color}-600 text-lg`}></i>
                                <h4 className={`text-sm font-bold text-${color}-700 uppercase`}>
                                    {getNombreCondicion(condicion)}
                                </h4>
                                <span className={`ml-auto bg-${color}-100 text-${color}-800 text-xs font-semibold px-2 py-0.5 rounded`}>
                                    {requisitosGrupo.length} requisito{requisitosGrupo.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Requisitos del Grupo */}
                            <div className="bg-white border border-gray-300 rounded-lg divide-y divide-gray-200">
                                {requisitosGrupo.map((requisito, index) => {
                                    const requistoIdNum = typeof requisito.id === 'string' ? parseInt(requisito.id) : requisito.id;
                                    const estadoEnMap = requisitosEstados.get(requistoIdNum);
                                    const isCompleted = estadoEnMap === 1;
                                    const archivosRequisito = archivosRequisitos.get(requistoIdNum) || [];

                                    return (
                                        <div
                                            key={requisito.id}
                                            className={`p-4 transition-colors ${isCompleted ? 'bg-green-50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox */}
                                                <div className="flex items-center h-5 mt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        id={`requisito-${requisito.id}`}
                                                        checked={isCompleted}
                                                        onChange={() => handleCheckboxChange(requisito.id)}
                                                        className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                    />
                                                </div>

                                                {/* Contenido */}
                                                <div className="flex-1 min-w-0">
                                                    <label
                                                        htmlFor={`requisito-${requisito.id}`}
                                                        className="cursor-pointer"
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <span className={`text-sm font-medium ${isCompleted
                                                                ? 'text-gray-500 line-through'
                                                                : 'text-gray-900'
                                                                }`}>
                                                                {index + 1}. {requisito.nombre_requisito}
                                                            </span>
                                                            <span className={`shrink-0 bg-${color}-100 text-${color}-800 text-xs font-semibold px-2 py-0.5 rounded`}>
                                                                {condicion === 'GENERAL' ? 'General' : condicion === 'DIVORCED' ? 'Divorciado' : condicion === 'WIDOWED' ? 'Viudo' : condicion}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs ${isCompleted ? 'text-gray-400' : 'text-gray-600'
                                                            }`}>
                                                            {requisito.descripcion}
                                                        </p>
                                                    </label>

                                                    {/* Sección de carga de archivo cuando está marcado */}
                                                    {isCompleted && (
                                                        <div className="mt-3 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <label className="cursor-pointer">
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) => handleRequisitoFileChange(requistoIdNum, e)}
                                                                        className="hidden"
                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                    />
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                                                                        <i className="fas fa-paperclip"></i>
                                                                        Adjuntar documento
                                                                    </span>
                                                                </label>
                                                                {archivosRequisito.length > 0 && (
                                                                    <span className="text-xs text-gray-600">
                                                                        {archivosRequisito.length} archivo{archivosRequisito.length !== 1 ? 's' : ''} adjunto{archivosRequisito.length !== 1 ? 's' : ''}
                                                                    </span>
                                                                )}

                                                                <span className='text-xs font-black text-red-800'>

                                                                    opcional*
                                                                </span>
                                                            </div>

                                                            {/* Lista de archivos adjuntos al requisito */}
                                                            {archivosRequisito.length > 0 && (
                                                                <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                                                                    {archivosRequisito.map((archivo) => (
                                                                        <div
                                                                            key={archivo.id}
                                                                            className="flex items-center gap-2 bg-white rounded p-2 text-xs"
                                                                        >
                                                                            <i className={`fas ${getIconoArchivo(archivo.tipo)}`}></i>
                                                                            <span className="flex-1 truncate font-medium text-gray-900">
                                                                                {archivo.nombre}
                                                                            </span>
                                                                            <span className="text-gray-500">
                                                                                {formatearTamaño(archivo.tamaño)}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleEliminarArchivoRequisito(requistoIdNum)}
                                                                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                                                title="Eliminar archivo"
                                                                            >
                                                                                <i className="fas fa-times"></i>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
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
                    );
                })}
            </div>

            {/* Mensaje Informativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <div className="shrink-0">
                    <i className="fas fa-info-circle text-blue-600 text-xl"></i>
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                    <p className="font-semibold mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>LA PROGRAMACIÓN DE MATRIMONIO SE REALIZA CON UN MES DE ANTICIPACIÓN.</li>
                        <li>Al marcar un requisito como completado, podrás adjuntar los documentos correspondientes.</li>
                        <li>Los documentos adicionales son opcionales pero recomendados para agilizar el proceso.</li>
                        <li>Asegúrese de que todos los documentos estén vigentes y sean legibles.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RequisitosMatrimonio;