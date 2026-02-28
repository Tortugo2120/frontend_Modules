import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useGetRequirements } from '../../../../../hooks/useGetRequeriments';
import { useApplicationContext } from '../../../../../context/ApplicationContext';
import { db } from '../../../../../model/documentModel';
import { useDocument } from '../../../../../hooks/useDocument';
import type { ArchivoSubido, ContrayenteInfo, ProgresoInfo, Requisito } from './types';
import { getRequisitoKey, formatearTamaño, MAX_FILE_SIZE } from './utils';

const REQUISITOS_INICIALES: Requisito[] = [];

const extractRequisitoId = (key: string): number => {
    const match = key.match(/^(\d+)-/);
    return match ? parseInt(match[1], 10) : parseInt(key, 10);
};

const ROLES_CONTRAYENTE = ['contrayente', 'divorciado'];
const DOCUMENT_TYPE_IDS_EXTRANJERO = [2, 3];
const REQUISITO_EDICTO_ID = 12;

const MARITAL_STATUS_TO_CONDICION: Record<string, string> = {
    'DIVORCIADO': 'DIVORCIADO',
    'DIVORCIADA': 'DIVORCIADA',
    'VIUDO':      'VIUDO',
    'VIUDA':      'VIUDA',
    'CASADO':     'CASADO',
    'CASADA':     'CASADA',
    'SEPARADO':   'SEPARATED',
    'SEPARADA':   'SEPARATED',
};

const normalizeCondicion = (maritalStatus: string): string =>
    MARITAL_STATUS_TO_CONDICION[maritalStatus.toUpperCase()] ?? maritalStatus.toUpperCase();

const buildCondicionesParticipante = (p: {
    maritalStatus?: string;
    documentTypeId?: number;
}): Set<string> => {
    const condiciones = new Set<string>(['GENERAL']);
    if (p.maritalStatus && !['Soltero', 'Soltera', 'soltero', 'soltera'].includes(p.maritalStatus)) {
        condiciones.add(normalizeCondicion(p.maritalStatus));
    }
    if (p.documentTypeId && DOCUMENT_TYPE_IDS_EXTRANJERO.includes(p.documentTypeId)) {
        condiciones.add('FOREIGNERS');
    }
    return condiciones;
};

export const useRequisitosMatrimonio = () => {
    const [requisitos, setRequisitos]                   = useState<Requisito[]>(REQUISITOS_INICIALES);
    const [archivos]                                    = useState<ArchivoSubido[]>([]);
    const [archivosRequisitos, setArchivosRequisitos]   = useState<Map<string, ArchivoSubido[]>>(new Map());
    const [requisitosEstados, setRequisitosEstados]     = useState<Map<string, number>>(new Map());
    const [observacionesMap, setObservacionesMap]       = useState<Map<string, string>>(new Map());
    const [erroresArchivo, setErroresArchivo]           = useState<Map<string, string>>(new Map());

    const { formDataAplication, updateRequisitos } = useApplicationContext();
    const { requirements, fetchRequirements }      = useGetRequirements();
    const { addDocument, deleteDocument }          = useDocument();

    const requirementsRef = useRef(requirements);
    useEffect(() => { requirementsRef.current = requirements; }, [requirements]);

    const requisitosRef = useRef(requisitos);
    useEffect(() => { requisitosRef.current = requisitos; }, [requisitos]);

    // ── Contrayentes ──────────────────────────────────────────────────────────
    const contrayentes = useMemo<ContrayenteInfo[]>(() => {
        const ctrys = formDataAplication.participants
            .filter(p => ROLES_CONTRAYENTE.includes(p.rol))
            .map(p => ({
                cui: p.cui,
                nombre: `${p.names} ${p.paternalSurname} ${p.maternalSurname}`,
                condiciones: buildCondicionesParticipante(p),
            }));
        return ctrys.length >= 2 ? ctrys.slice(0, 2) : ctrys;
    }, [formDataAplication.participants]);

    // String estable de condiciones 
    const conditionString = useMemo(() => {
        const conds = new Set<string>(['GENERAL']);
        formDataAplication.participants.forEach(p => {
            if (!ROLES_CONTRAYENTE.includes(p.rol)) return;
            buildCondicionesParticipante(p).forEach(c => conds.add(c));
        });
        return Array.from(conds).sort().join(',');
    }, [formDataAplication.participants]);

    // Cargar estados desde el contexto 
    useEffect(() => {
        if (!formDataAplication.requirements?.length) return;
        const estadosMap = new Map<string, number>(
            formDataAplication.requirements.map(r => [String(r.requirementId), r.delivered])
        );
        setRequisitosEstados(estadosMap);
        const obsMap = new Map<string, string>(
            formDataAplication.requirements
                .filter(r => r.observation)
                .map(r => [String(r.requirementId), r.observation as string])
        );
        setObservacionesMap(obsMap);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cargar archivos desde IndexedDB 
    useEffect(() => {
        (async () => {
            try {
                const docs = await db.documents.toArray();
                const newMap = new Map<string, ArchivoSubido[]>();
                docs.forEach(doc => {
                    if (!doc.file) return;
                    const archivo: ArchivoSubido = {
                        id: `${doc.requirementId}-${doc.file.name}`,
                        nombre: doc.nombreArchivo || doc.file.name,
                        tamaño: doc.file.size,
                        tipo: doc.file.type,
                        archivo: doc.file,
                    };
                    const key = String(doc.requirementId);
                    newMap.set(key, [...(newMap.get(key) ?? []), archivo]);
                });
                setArchivosRequisitos(newMap);
            } catch (e) {
                console.error('Error al cargar archivos desde IndexedDB:', e);
            }
        })();
    }, []);

    // Sincronizar requisitos al contexto 
    useEffect(() => {
        if (requirements.length === 0) return;
        const arr: { requirementId: string; delivered: number; observation: string; cui: string | null }[] = [];

        requirements.forEach(req => {
            const condicion = req.condicion || 'GENERAL';
            if (req.tipo_requisito === 'general') {
                const key = getRequisitoKey(req.id, 0, 'general');
                arr.push({ requirementId: key, delivered: requisitosEstados.get(key) ?? 0, observation: observacionesMap.get(key) ?? '', cui: null });
            } else {
                contrayentes.forEach((ctry, ctryIndex) => {
                    if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                        const key = getRequisitoKey(req.id, ctryIndex + 1);
                        const cuiValue = req.id === REQUISITO_EDICTO_ID ? null : (ctry.cui ?? null);
                        arr.push({ requirementId: key, delivered: requisitosEstados.get(key) ?? 0, observation: observacionesMap.get(key) ?? '', cui: cuiValue });
                    }
                });
            }
        });
        updateRequisitos(arr);
    }, [requisitosEstados, observacionesMap, requirements, contrayentes, updateRequisitos]);

    // Fetch de requerimientos
    useEffect(() => {
        const applicationTypeId = formDataAplication.application.applicationTypeId;
        if (applicationTypeId <= 0) return;
        console.log('[fetchRequirements] id:', applicationTypeId, '| conditions:', conditionString);
        fetchRequirements(applicationTypeId, conditionString);
    }, [formDataAplication.application.applicationTypeId, conditionString, fetchRequirements]);

    // Progreso por contrayente 
    const calcularProgresoPorContrayente = useCallback((contrayenteIndex: number): ProgresoInfo => {
        const reqs = requirementsRef.current;
        if (reqs.length === 0) return { completados: 0, total: 0, porcentaje: 0 };
        const ctry = contrayentes[contrayenteIndex - 1];
        if (!ctry) return { completados: 0, total: 0, porcentaje: 0 };

        const requisitosCtry = reqs.filter(req => {
            if (req.tipo_requisito === 'general') return false;
            const condicion = req.condicion || 'GENERAL';
            return condicion === 'GENERAL' || ctry.condiciones.has(condicion);
        });
        const total = requisitosCtry.length;
        let completados = 0;
        requisitosCtry.forEach(req => {
            if (requisitosEstados.get(getRequisitoKey(req.id, contrayenteIndex)) === 1) completados++;
        });
        return { completados, total, porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0 };
    }, [contrayentes, requisitosEstados]);

    // Progreso total 
    const calcularProgreso = useCallback((): ProgresoInfo => {
        const reqs = requirementsRef.current;
        if (reqs.length > 0) {
            let total = 0, completados = 0;
            reqs.forEach(req => {
                if (req.tipo_requisito === 'general') {
                    total++;
                    if (requisitosEstados.get(getRequisitoKey(req.id, 0, 'general')) === 1) completados++;
                }
            });
            contrayentes.forEach((_, i) => {
                const p = calcularProgresoPorContrayente(i + 1);
                total += p.total;
                completados += p.completados;
            });
            return { completados, total, porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0 };
        }
        const total = requisitosRef.current.length;
        const completados = requisitosRef.current.filter(r => r.completado).length;
        return { completados, total, porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0 };
    }, [contrayentes, calcularProgresoPorContrayente, requisitosEstados]);

   
    const handleCheckboxChange = useCallback((
        requisitoId: string | number,
        contrayenteIndex: number       
    ) => {
        if (requirementsRef.current.length > 0) {
           
            const key = contrayenteIndex === 0
                ? getRequisitoKey(requisitoId, 0, 'general')
                : getRequisitoKey(requisitoId, contrayenteIndex);

            setRequisitosEstados(prev => {
                const next = new Map(prev);
                next.set(key, next.get(key) === 1 ? 0 : 1);
                return next;
            });
        } else {
 
            setRequisitos(prev =>
                prev.map(req =>
                    req.id === requisitoId ? { ...req, completado: !req.completado } : req
                )
            );
        }
    }, []); 

    // Marcar todos 
    const marcarTodosObligatorios = useCallback((contrayenteIndex?: number) => {
        const reqs = requirementsRef.current;
        if (reqs.length > 0) {
            setRequisitosEstados(prev => {
                const next = new Map(prev);
                reqs.forEach(req => {
                    if (req.tipo_requisito === 'general') {
                        if (!contrayenteIndex) next.set(getRequisitoKey(req.id, 0, 'general'), 1);
                    } else {
                        const indices = contrayenteIndex ? [contrayenteIndex] : contrayentes.map((_, i) => i + 1);
                        indices.forEach(idx => {
                            const ctry = contrayentes[idx - 1];
                            if (!ctry) return;
                            const condicion = req.condicion || 'GENERAL';
                            if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                                next.set(getRequisitoKey(req.id, idx), 1);
                            }
                        });
                    }
                });
                return next;
            });
        } else {
            setRequisitos(prev => prev.map(req => req.obligatorio ? { ...req, completado: true } : req));
        }
    }, [contrayentes]);

    // Desmarcar todos
    const desmarcarTodos = useCallback(async (contrayenteIndex?: number) => {
        const reqs = requirementsRef.current;
        if (reqs.length > 0) {
            setRequisitosEstados(prev => {
                const next = new Map(prev);
                reqs.forEach(req => {
                    if (req.tipo_requisito === 'general') {
                        if (!contrayenteIndex) next.set(getRequisitoKey(req.id, 0, 'general'), 0);
                    } else {
                        const indices = contrayenteIndex ? [contrayenteIndex] : contrayentes.map((_, i) => i + 1);
                        indices.forEach(idx => {
                            const ctry = contrayentes[idx - 1];
                            if (!ctry) return;
                            const condicion = req.condicion || 'GENERAL';
                            if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                                next.set(getRequisitoKey(req.id, idx), 0);
                            }
                        });
                    }
                });
                return next;
            });
            try { await db.documents.clear(); } catch (e) { console.error(e); }
            setArchivosRequisitos(new Map());
        } else {
            setRequisitos(prev => prev.map(req => ({ ...req, completado: false })));
        }
    }, [contrayentes]);

    // Archivo 
    const handleRequisitoFileChange = useCallback(async (
        requisitoKey: string,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            setErroresArchivo(prev => new Map(prev).set(requisitoKey,
                `El archivo "${file.name}" supera el límite de 5 MB (${formatearTamaño(file.size)}).`));
            e.target.value = '';
            return;
        }
        setErroresArchivo(prev => { const m = new Map(prev); m.delete(requisitoKey); return m; });

        const nuevoArchivo: ArchivoSubido = {
            id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            nombre: file.name, tamaño: file.size, tipo: file.type, archivo: file,
        };
        const requisitoId = extractRequisitoId(requisitoKey);
        try {
            await db.documents.where('requirementId').equals(requisitoId).delete();
            await addDocument({ requirementId: requisitoId, file: nuevoArchivo.archivo, nombreArchivo: nuevoArchivo.nombre });
        } catch (e) { console.error('Error IndexedDB:', e); }

        setArchivosRequisitos(prev => new Map(prev).set(requisitoKey, [nuevoArchivo]));
        e.target.value = '';
    }, [addDocument]);

    const handleEliminarArchivoRequisito = useCallback(async (requisitoKey: string) => {
        try { await deleteDocument(extractRequisitoId(requisitoKey)); } catch (e) { console.error(e); }
        setArchivosRequisitos(prev => { const m = new Map(prev); m.delete(requisitoKey); return m; });
        setErroresArchivo(prev => { const m = new Map(prev); m.delete(requisitoKey); return m; });
    }, [deleteDocument]);

    const handleObservacionChange = useCallback((requisitoKey: string, value: string) => {
        setObservacionesMap(prev => {
            const next = new Map(prev);
            if (value.trim()) next.set(requisitoKey, value); else next.delete(requisitoKey);
            return next;
        });
    }, []);

    const handleErrorClear = useCallback((requisitoKey: string) => {
        setErroresArchivo(prev => { const m = new Map(prev); m.delete(requisitoKey); return m; });
    }, []);

    // Agrupar por condición (solo individuales) 
    const requisitosAgrupadosPorContrayente = useCallback((contrayenteIndex: number) => {
        const ctry = contrayentes[contrayenteIndex - 1];
        if (!ctry) return {};
        const grupos: { [key: string]: typeof requirements } = {};
        requirementsRef.current.forEach(req => {
            if (req.tipo_requisito === 'general') return;
            const condicion = req.condicion || 'GENERAL';
            if (condicion === 'GENERAL' || ctry.condiciones.has(condicion)) {
                if (!grupos[condicion]) grupos[condicion] = [];
                grupos[condicion].push(req);
            }
        });
        return grupos;
    }, [contrayentes, requirements]);

    return {
        requisitos, archivos, archivosRequisitos, requisitosEstados,
        observacionesMap, erroresArchivo, contrayentes, requirements,
        calcularProgreso, calcularProgresoPorContrayente, requisitosAgrupadosPorContrayente,
        handleCheckboxChange, marcarTodosObligatorios, desmarcarTodos,
        handleRequisitoFileChange, handleEliminarArchivoRequisito,
        handleObservacionChange, handleErrorClear,
    };
};