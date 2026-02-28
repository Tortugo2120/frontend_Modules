import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGetRequirements } from '../../../../../hooks/useGetRequeriments';
import { useApplicationContext } from '../../../../../context/ApplicationContext';
import { db } from '../../../../../model/documentModel';
import { useDocument } from '../../../../../hooks/useDocument';
import type { ArchivoSubido, ContrayenteInfo, ProgresoInfo, Requisito } from './types';
import { getRequisitoKey, formatearTamaño, MAX_FILE_SIZE } from './utils';

const REQUISITOS_INICIALES: Requisito[] = [];

// ── Extrae el requirementId numérico desde cualquier formato de clave ──
// Soporta: "8-ctry1", "8-ctry2", "8-general"
const extractRequisitoId = (key: string): number => {
    const match = key.match(/^(\d+)-/);
    return match ? parseInt(match[1], 10) : parseInt(key, 10);
};

export const useRequisitosMatrimonio = () => {
    const [requisitos, setRequisitos] = useState<Requisito[]>(REQUISITOS_INICIALES);
    const [archivos] = useState<ArchivoSubido[]>([]);
    const [archivosRequisitos, setArchivosRequisitos] = useState<Map<string, ArchivoSubido[]>>(new Map());
    const [requisitosEstados, setRequisitosEstados] = useState<Map<string, number>>(new Map());
    const [observacionesMap, setObservacionesMap] = useState<Map<string, string>>(new Map());
    const [erroresArchivo, setErroresArchivo] = useState<Map<string, string>>(new Map());

    const { formDataAplication, updateRequisitos } = useApplicationContext();
    const { requirements, fetchRequirements } = useGetRequirements();
    const { addDocument, deleteDocument } = useDocument();

    // ── Obtener los contrayentes del formulario ──
    const contrayentes = useMemo<ContrayenteInfo[]>(() => {
        const ctrys = formDataAplication.participants
            .filter(p => p.rol === 'contrayente')
            .map((p) => {
                const condiciones = new Set<string>(["GENERAL"]);
                if (p.maritalStatus && p.maritalStatus !== "Soltero") {
                    condiciones.add(p.maritalStatus.toUpperCase());
                }
                return {
                    cui: p.cui,
                    nombre: `${p.names} ${p.paternalSurname} ${p.maternalSurname}`,
                    condiciones,
                };
            });
        return ctrys.length >= 2 ? ctrys.slice(0, 2) : ctrys;
    }, [formDataAplication.participants]);

    // ── Cargar estados guardados desde el contexto al iniciar ──
    useEffect(() => {
        if (formDataAplication.requirements && formDataAplication.requirements.length > 0) {
            const estadosMap = new Map<string, number>(
                formDataAplication.requirements.map(r => {
                    const key = typeof r.requirementId === 'string' ? r.requirementId : String(r.requirementId);
                    return [key, r.delivered];
                })
            );
            setRequisitosEstados(estadosMap);

            const obsMap = new Map<string, string>(
                formDataAplication.requirements
                    .filter(r => r.observation)
                    .map(r => {
                        const key = typeof r.requirementId === 'string' ? r.requirementId : String(r.requirementId);
                        return [key, r.observation as string];
                    })
            );
            setObservacionesMap(obsMap);
        }
    }, []);

    // ── Cargar archivos guardados desde IndexedDB al iniciar ──
    useEffect(() => {
        const cargarArchivosGuardados = async () => {
            try {
                const todosLosDocumentos = await db.documents.toArray();
                const newMap = new Map<string, ArchivoSubido[]>();

                todosLosDocumentos.forEach(doc => {
                    if (doc.file) {
                        const archivo: ArchivoSubido = {
                            id: `${doc.requirementId}-${doc.file.name}`,
                            nombre: doc.nombreArchivo || doc.file.name,
                            tamaño: doc.file.size,
                            tipo: doc.file.type,
                            archivo: doc.file
                        };
                        const key = String(doc.requirementId);
                        const archivosExistentes = newMap.get(key) || [];
                        newMap.set(key, [...archivosExistentes, archivo]);
                    }
                });

                setArchivosRequisitos(newMap);
            } catch (error) {
                console.error('Error al cargar archivos desde IndexedDB:', error);
            }
        };

        cargarArchivosGuardados();
    }, []);

    // ── Actualizar requisitos en el contexto ──
    useEffect(() => {
        if (requirements.length === 0) return;

        const requisitosArray: { requirementId: string; delivered: number; observation: string }[] = [];

        requirements.forEach(req => {
            const condicion = req.condicion || 'GENERAL';

            if (req.tipo_requisito === 'general') {
                // Requisito general: una sola entrada compartida
                const key = getRequisitoKey(req.id, 0, 'general');
                requisitosArray.push({
                    requirementId: key,
                    delivered: requisitosEstados.get(key) ?? 0,
                    observation: observacionesMap.get(key) ?? '',
                });
            } else {
                // Requisito individual: una entrada por contrayente que aplique
                contrayentes.forEach((ctry, ctryIndex) => {
                    if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                        const key = getRequisitoKey(req.id, ctryIndex + 1);
                        requisitosArray.push({
                            requirementId: key,
                            delivered: requisitosEstados.get(key) ?? 0,
                            observation: observacionesMap.get(key) ?? '',
                        });
                    }
                });
            }
        });

        updateRequisitos(requisitosArray);
    }, [requisitosEstados, observacionesMap, requirements, contrayentes, updateRequisitos]);

    // ── Cargar requerimientos según tipo de solicitud ──
    useEffect(() => {
        const obtenerCondiciones = () => {
            const conds = new Set<string>(["GENERAL"]);
            formDataAplication.participants.forEach((p) => {
                if (p.maritalStatus && p.maritalStatus !== "Soltero" && p.rol !== "testigo") {
                    conds.add(p.maritalStatus.toUpperCase());
                }
            });
            return Array.from(conds).join(',');
        };

        const cargarRequeriments = async () => {
            const applicationTypeId = formDataAplication.application.applicationTypeId;
            const condition = obtenerCondiciones();
            await fetchRequirements(applicationTypeId, condition);
        };

        if (formDataAplication.application.applicationTypeId > 0) {
            cargarRequeriments();
        }
    }, [formDataAplication.application.applicationTypeId, formDataAplication.participants, fetchRequirements]);

    // ── Calcular progreso por contrayente (solo individuales) ──
    const calcularProgresoPorContrayente = useCallback((contrayenteIndex: number): ProgresoInfo => {
        if (requirements.length === 0) return { completados: 0, total: 0, porcentaje: 0 };

        const ctry = contrayentes[contrayenteIndex - 1];
        if (!ctry) return { completados: 0, total: 0, porcentaje: 0 };

        const requisitosCtry = requirements.filter(req => {
            if (req.tipo_requisito === 'general') return false;
            const condicion = req.condicion || 'GENERAL';
            return condicion === 'GENERAL' || ctry.condiciones.has(condicion);
        });

        const total = requisitosCtry.length;
        let completados = 0;

        requisitosCtry.forEach(req => {
            const key = getRequisitoKey(req.id, contrayenteIndex);
            if (requisitosEstados.get(key) === 1) completados++;
        });

        return {
            completados,
            total,
            porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0
        };
    }, [requirements, requisitosEstados, contrayentes]);

    // ── Calcular progreso total (generales cuentan UNA vez) ──
    const calcularProgreso = useCallback((): ProgresoInfo => {
        let total = 0;
        let completados = 0;

        if (requirements.length > 0) {
            // Generales: contar una sola vez
            requirements.forEach(req => {
                if (req.tipo_requisito === 'general') {
                    total++;
                    const key = getRequisitoKey(req.id, 0, 'general');
                    if (requisitosEstados.get(key) === 1) completados++;
                }
            });

            // Individuales: contar por contrayente
            contrayentes.forEach((_, ctryIndex) => {
                const prog = calcularProgresoPorContrayente(ctryIndex + 1);
                total += prog.total;
                completados += prog.completados;
            });
        } else {
            total = requisitos.length;
            completados = requisitos.filter(r => r.completado).length;
        }

        return {
            completados,
            total,
            porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0
        };
    }, [requisitos, requirements, contrayentes, calcularProgresoPorContrayente, requisitosEstados]);

    // ── handleCheckboxChange: contrayenteIndex=0 → general ──
    const handleCheckboxChange = useCallback((requisitoId: string | number, contrayenteIndex: number) => {
        if (requirements.length > 0) {
            const key = contrayenteIndex === 0
                ? getRequisitoKey(requisitoId, 0, 'general')
                : getRequisitoKey(requisitoId, contrayenteIndex);

            setRequisitosEstados(prev => {
                const newMap = new Map(prev);
                newMap.set(key, newMap.get(key) === 1 ? 0 : 1);
                return newMap;
            });
        } else {
            setRequisitos(prev =>
                prev.map(req => req.id === requisitoId ? { ...req, completado: !req.completado } : req)
            );
        }
    }, [requirements]);

    // ── Marcar todos los requisitos ──
    const marcarTodosObligatorios = useCallback((contrayenteIndex?: number) => {
        if (requirements.length > 0) {
            setRequisitosEstados(prev => {
                const newMap = new Map(prev);

                requirements.forEach(req => {
                    if (req.tipo_requisito === 'general') {
                        // Los generales solo se marcan cuando no se filtra por contrayente
                        if (!contrayenteIndex) {
                            newMap.set(getRequisitoKey(req.id, 0, 'general'), 1);
                        }
                    } else {
                        const indices = contrayenteIndex
                            ? [contrayenteIndex]
                            : contrayentes.map((_, i) => i + 1);

                        indices.forEach(idx => {
                            const ctry = contrayentes[idx - 1];
                            if (!ctry) return;
                            const condicion = req.condicion || 'GENERAL';
                            if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                                newMap.set(getRequisitoKey(req.id, idx), 1);
                            }
                        });
                    }
                });

                return newMap;
            });
        } else {
            setRequisitos(prev =>
                prev.map(req => req.obligatorio ? { ...req, completado: true } : req)
            );
        }
    }, [requirements, contrayentes]);

    // ── Desmarcar todos los requisitos ──
    const desmarcarTodos = useCallback(async (contrayenteIndex?: number) => {
        if (requirements.length > 0) {
            setRequisitosEstados(prev => {
                const newMap = new Map(prev);

                requirements.forEach(req => {
                    if (req.tipo_requisito === 'general') {
                        if (!contrayenteIndex) {
                            newMap.set(getRequisitoKey(req.id, 0, 'general'), 0);
                        }
                    } else {
                        const indices = contrayenteIndex
                            ? [contrayenteIndex]
                            : contrayentes.map((_, i) => i + 1);

                        indices.forEach(idx => {
                            const ctry = contrayentes[idx - 1];
                            if (!ctry) return;
                            const condicion = req.condicion || 'GENERAL';
                            if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                                newMap.set(getRequisitoKey(req.id, idx), 0);
                            }
                        });
                    }
                });

                return newMap;
            });

            try {
                await db.documents.clear();
            } catch (error) {
                console.error('Error al limpiar IndexedDB:', error);
            }

            setArchivosRequisitos(new Map());
        } else {
            setRequisitos(prev => prev.map(req => ({ ...req, completado: false })));
        }
    }, [requirements, contrayentes]);

    // ── Manejar cambio de archivo ──
    // FIX: usa extractRequisitoId() en lugar de split('-ctry')[0]
    // para soportar claves "-general" y "-ctryN"
    const handleRequisitoFileChange = useCallback(async (
        requisitoKey: string,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];

        if (file.size > MAX_FILE_SIZE) {
            setErroresArchivo(prev => {
                const newMap = new Map(prev);
                newMap.set(
                    requisitoKey,
                    `El archivo "${file.name}" supera el límite de 5 MB (${formatearTamaño(file.size)}). Por favor selecciona un archivo más pequeño.`
                );
                return newMap;
            });
            e.target.value = '';
            return;
        }

        setErroresArchivo(prev => {
            const newMap = new Map(prev);
            newMap.delete(requisitoKey);
            return newMap;
        });

        const nuevoArchivo: ArchivoSubido = {
            id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            nombre: file.name,
            tamaño: file.size,
            tipo: file.type,
            archivo: file
        };

        // ✅ CORRECCIÓN: extraer ID correctamente desde cualquier formato de clave
        const requisitoId = extractRequisitoId(requisitoKey);

        try {
            await db.documents.where('requirementId').equals(requisitoId).delete();
            await addDocument({
                requirementId: requisitoId,
                file: nuevoArchivo.archivo,
                nombreArchivo: nuevoArchivo.nombre
            });
        } catch (error) {
            console.error('Error al guardar archivos en IndexedDB:', error);
        }

        setArchivosRequisitos(prev => {
            const newMap = new Map(prev);
            newMap.set(requisitoKey, [nuevoArchivo]);
            return newMap;
        });

        e.target.value = '';
    }, [addDocument]);

    // ── Eliminar archivo ──
    // FIX: usa extractRequisitoId() en lugar de split('-ctry')[0]
    const handleEliminarArchivoRequisito = useCallback(async (requisitoKey: string) => {
        // ✅ CORRECCIÓN: extraer ID correctamente desde cualquier formato de clave
        const requisitoId = extractRequisitoId(requisitoKey);

        try {
            await deleteDocument(requisitoId);
        } catch (error) {
            console.error('Error al eliminar archivo de IndexedDB:', error);
        }

        setArchivosRequisitos(prev => {
            const newMap = new Map(prev);
            newMap.delete(requisitoKey);
            return newMap;
        });

        setErroresArchivo(prev => {
            const newMap = new Map(prev);
            newMap.delete(requisitoKey);
            return newMap;
        });
    }, [deleteDocument]);

    // ── Manejar cambio de observación ──
    const handleObservacionChange = useCallback((requisitoKey: string, value: string) => {
        setObservacionesMap(prev => {
            const next = new Map(prev);
            if (value.trim()) next.set(requisitoKey, value);
            else next.delete(requisitoKey);
            return next;
        });
    }, []);

    // ── Limpiar error de archivo ──
    const handleErrorClear = useCallback((requisitoKey: string) => {
        setErroresArchivo(prev => {
            const newMap = new Map(prev);
            newMap.delete(requisitoKey);
            return newMap;
        });
    }, []);

    // ── Agrupar requisitos por condición para un contrayente (solo individuales) ──
    const requisitosAgrupadosPorContrayente = useCallback((contrayenteIndex: number) => {
        const ctry = contrayentes[contrayenteIndex - 1];
        if (!ctry) return {};

        const grupos: { [key: string]: typeof requirements } = {};

        requirements.forEach(req => {
            if (req.tipo_requisito === 'general') return; // los generales se renderizan aparte
            const condicion = req.condicion || 'GENERAL';
            if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                if (!grupos[condicion]) grupos[condicion] = [];
                grupos[condicion].push(req);
            }
        });

        return grupos;
    }, [requirements, contrayentes]);

    return {
        // Estados
        requisitos,
        archivos,
        archivosRequisitos,
        requisitosEstados,
        observacionesMap,
        erroresArchivo,
        contrayentes,
        requirements,

        // Funciones de cálculo
        calcularProgreso,
        calcularProgresoPorContrayente,
        requisitosAgrupadosPorContrayente,

        // Handlers
        handleCheckboxChange,
        marcarTodosObligatorios,
        desmarcarTodos,
        handleRequisitoFileChange,
        handleEliminarArchivoRequisito,
        handleObservacionChange,
        handleErrorClear,
    };
};