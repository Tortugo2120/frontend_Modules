import { useMemo, useEffect } from "react";
import type { CreateApplicationPayload } from "../../../model/aplicationModel.ts";
import type { Participant } from "../../../model/aplicationModel.ts";
import { useGetOficiantes } from "../../../hooks/useGetOficiantes.ts";
import { useGetRequirements } from "../../../hooks/useGetRequeriments.ts";
import { detectFlowType } from "../../../config/stepsConfig.ts";

// ── helpers para parsear las claves compuestas de requisitos ──
const extractReqId = (key: string | number): number => {
    const str = String(key);
    const match = str.match(/^(\d+)-/);
    return match ? parseInt(match[1], 10) : parseInt(str, 10);
};
const isGeneralKey = (key: string | number): boolean =>
    String(key).endsWith('-general');

// ── misma lógica de condiciones que useRequisitosMatrimonio ──
const ROLES_CONTRAYENTE_CONF = ['contrayente', 'divorciado'];
const DOCUMENT_TYPE_IDS_EXTRANJERO_CONF = [2, 3];
const MARITAL_STATUS_MAP: Record<string, string> = {
    'DIVORCIADO': 'DIVORCIADO', 'DIVORCIADA': 'DIVORCIADA',
    'VIUDO': 'VIUDO',           'VIUDA': 'VIUDA',
    'CASADO': 'CASADO',         'CASADA': 'CASADA',
    'SEPARADO': 'SEPARATED',    'SEPARADA': 'SEPARATED',
};
const buildCondicionString = (participants: CreateApplicationPayload['participants']): string => {
    const conds = new Set<string>(['GENERAL']);
    participants.forEach(p => {
        if (!ROLES_CONTRAYENTE_CONF.includes(p.rol)) return;
        if (p.maritalStatus && !['Soltero', 'Soltera', 'soltero', 'soltera'].includes(p.maritalStatus)) {
            conds.add(MARITAL_STATUS_MAP[p.maritalStatus.toUpperCase()] ?? p.maritalStatus.toUpperCase());
        }
        if (p.documentTypeId && DOCUMENT_TYPE_IDS_EXTRANJERO_CONF.includes(p.documentTypeId)) {
            conds.add('FOREIGNERS');
        }
    });
    return Array.from(conds).sort().join(',');
};

interface ConfirmationSummaryProps {
    tipoSolicitud: number | null;
    tipoNombre: string | undefined;
    precio: number | undefined;
    descriptionSolicitud: string | undefined;
    applicationData: CreateApplicationPayload;
    onConfirm: () => void;
    isSubmitting: boolean;
}

// ── Roles que se consideran "involucrados principales" ──
// Igual que en useRequisitosMatrimonio — centralizar aquí también
const ROLES_INVOLUCRADOS = ['contrayente', 'divorciado'];

export default function ConfirmationSummary({
    tipoNombre,
    descriptionSolicitud,
    precio,
    applicationData,
    onConfirm,
    isSubmitting
}: ConfirmationSummaryProps) {
    // Detectar el tipo de flujo automáticamente a partir del nombre
    const flowType = tipoNombre ? detectFlowType(tipoNombre) : 'generico';
    const esMatrimonio = flowType === 'matrimonio';
    const esDivorcio   = flowType === 'divorcio';

    // Extraer datos del solicitante principal (participante con role 'solicitante')
    const solicitante = applicationData.participants.find(p => p.rol === 'solicitante');

    // ✅ FIX: incluye tanto 'contrayente' (matrimonio) como 'divorciado' (divorcio)
    const involucrados = applicationData.participants.filter(p =>
        ROLES_INVOLUCRADOS.includes(p.rol)
    );

    const testigos = applicationData.participants.filter(p => p.rol === 'testigo');

    // Label e icono dinámicos según flujo
    const labelInvolucrados = esMatrimonio
        ? 'Prometidos'
        : esDivorcio
            ? 'Involucrados en el Divorcio'
            : 'Involucrados';

    const iconInvolucrados = esMatrimonio
        ? 'fa-user-friends'
        : esDivorcio
            ? 'fa-handshake-slash'
            : 'fa-users';

    const labelCard = (index: number) =>
        esMatrimonio
            ? `Prometido ${index + 1}`
            : esDivorcio
                ? index === 0 ? 'Demandante' : 'Demandado'
                : `Involucrado ${index + 1}`;

    // ── Cargar nombres de requisitos para mostrar en el resumen ──
    const { requirements: reqCatalog, fetchRequirements } = useGetRequirements();
    const conditionString = useMemo(
        () => buildCondicionString(applicationData.participants),
        [applicationData.participants]
    );
    useEffect(() => {
        const typeId = applicationData.application.applicationTypeId;
        if (typeId > 0) fetchRequirements(typeId, conditionString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationData.application.applicationTypeId, conditionString]);

    // Mapa id → nombre para búsqueda O(1)
    const reqNamesMap = useMemo(() => {
        const m = new Map<number, string>();
        reqCatalog.forEach(r => m.set(Number(r.id), r.nombre_requisito));
        return m;
    }, [reqCatalog]);

    // Agrupar requisitos: generales vs. por-contrayente (usando cui)
    const { generalReqs, reqsByCui } = useMemo(() => {
        const gen: NonNullable<typeof applicationData.requirements> = [];
        const byCui = new Map<string, NonNullable<typeof applicationData.requirements>>();
        (applicationData.requirements ?? []).forEach(r => {
            if (isGeneralKey(r.requirementId)) {
                gen.push(r);
            } else {
                const key = r.cui ?? '__sin_cui__';
                if (!byCui.has(key)) byCui.set(key, []);
                byCui.get(key)!.push(r);
            }
        });
        return { generalReqs: gen, reqsByCui: byCui };
    }, [applicationData.requirements]);

    // Contar entregados por contrayente
    const contadoPorCui = useMemo(() => {
        const counts = new Map<string, { total: number; entregados: number }>();
        reqsByCui.forEach((reqs, cui) => {
            counts.set(cui, {
                total: reqs.length,
                entregados: reqs.filter(r => r.delivered === 1).length,
            });
        });
        return counts;
    }, [reqsByCui]);

    // Resolver nombre del oficiante
    const { oficiantes } = useGetOficiantes('oficiante');
    const marriageDetails = applicationData.marriageDetails;
    const oficianteEncontrado = oficiantes.find(
        o => String(o.id) === String(marriageDetails?.marriageOfficiantId)
    );

    // Formatear fecha
    const formatearFecha = (dateString?: string) => {
        if (!dateString) return 'No especificada';
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i className="fas fa-check text-white text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirme su solicitud</h2>
                <p className="text-gray-600">Revise los datos antes de enviar</p>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="text-gray-600 font-medium">Tipo de Solicitud:</span>
                    <span className="font-bold text-gray-900">
                        {tipoNombre}
                        <span className="text-xs block text-right">
                            {descriptionSolicitud}
                        </span>
                    </span>
                </div>

                {solicitante && (
                    <>
                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                            <span className="text-gray-600 font-medium">Solicitante:</span>
                            <span className="font-semibold text-gray-900">
                                {solicitante.names} {solicitante.paternalSurname} {solicitante.maternalSurname}
                            </span>
                        </div>
                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                            <span className="text-gray-600 font-medium">DNI:</span>
                            <span className="font-semibold text-gray-900">{solicitante.cui}</span>
                        </div>
                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                            <span className="text-gray-600 font-medium">Teléfono:</span>
                            <span className="font-semibold text-gray-900">{solicitante.phone}</span>
                        </div>
                        {solicitante.email && (
                            <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                <span className="text-gray-600 font-medium">Email:</span>
                                <span className="font-semibold text-gray-900">{solicitante.email}</span>
                            </div>
                        )}
                    </>
                )}

                {/* Número de expediente si existe */}
                {applicationData.application.expedientNumber && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">N° Expediente:</span>
                        <span className="font-semibold text-blue-600">{applicationData.application.expedientNumber}</span>
                    </div>
                )}

                {/* Participantes adicionales */}
                {applicationData.participants.length > 1 && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">Participantes:</span>
                        <span className="font-semibold text-gray-900">{applicationData.participants.length} persona(s)</span>
                    </div>
                )}

                {/* Requisitos */}
                {applicationData.requirements && applicationData.requirements.length > 0 && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">Requisitos:</span>
                        <span className="font-semibold text-gray-900">
                            {applicationData.requirements.filter(r => r.delivered === 1).length} de {applicationData.requirements.length} completados
                        </span>
                    </div>
                )}

                {/* Precio */}
                <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Precio:</span>
                    <span className="font-semibold text-gray-900">S/. {precio}</span>
                </div>
            </div>

            {/* ─── Sección de Involucrados / Contrayentes / Divorciados ─── */}
            {involucrados.length > 0 && (
                <div className={`mt-6 rounded-xl p-6 border ${
                    esDivorcio
                        ? 'bg-linear-to-br from-orange-50 to-amber-50 border-orange-200'
                        : 'bg-linear-to-br from-blue-50 to-blue-100 border-blue-200'
                }`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className={`fas ${iconInvolucrados} ${esDivorcio ? 'text-orange-600' : 'text-blue-600'}`}></i>
                        {labelInvolucrados} ({involucrados.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {involucrados.map((involucrado: Participant, index: number) => (
                            <div key={involucrado.cui} className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <i className={`fas fa-user-circle ${esDivorcio ? 'text-orange-500' : 'text-blue-500'}`}></i>
                                    {labelCard(index)}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs text-gray-500">Nombres Completos:</span>
                                        <p className="text-sm font-medium text-gray-900">
                                            {involucrado.names} {involucrado.paternalSurname} {involucrado.maternalSurname}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">DNI:</span>
                                        <p className="text-sm font-medium text-gray-900">{involucrado.cui}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Sexo:</span>
                                        <p className="text-sm font-medium text-gray-900">
                                            {involucrado.gender === 'M' ? 'Masculino' : 'Femenino'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Estado Civil:</span>
                                        <p className="text-sm font-medium text-gray-900">{involucrado.maritalStatus}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Teléfono:</span>
                                        <p className="text-sm font-medium text-gray-900">{involucrado.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Email:</span>
                                        <p className="text-sm font-medium text-gray-900">{involucrado.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Sección de Requisitos por Contrayente ─── */}
            {(esMatrimonio || esDivorcio) && (applicationData.requirements ?? []).length > 0 && (
                <div className={`mt-6 bg-linear-to-br rounded-xl p-6 border ${esDivorcio ? 'from-orange-50 to-amber-50 border-orange-200' : 'from-indigo-50 to-violet-50 border-indigo-200'}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className={`fas fa-clipboard-check ${esDivorcio ? 'text-orange-600' : 'text-indigo-600'}`}></i>
                        Requisitos Presentados
                        <span className={`ml-auto text-sm font-normal px-2.5 py-1 rounded-full ${esDivorcio ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {(applicationData.requirements ?? []).filter(r => r.delivered === 1).length}
                            &nbsp;/ {(applicationData.requirements ?? []).length} entregados
                        </span>
                    </h3>

                    {/* — Requisitos por contrayente — */}
                    {involucrados.map((inv, idx) => {
                        const reqs = reqsByCui.get(inv.cui) ?? [];
                        if (reqs.length === 0) return null;
                        const { entregados, total } = contadoPorCui.get(inv.cui) ?? { entregados: 0, total: 0 };
                        const pct = total > 0 ? Math.round((entregados / total) * 100) : 0;
                        return (
                            <div key={inv.cui} className="mb-5">
                                {/* Cabecera contrayente */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <i className={`fas fa-user-circle text-base ${esDivorcio ? 'text-orange-400' : 'text-indigo-400'}`}></i>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {labelCard(idx)}: {inv.names} {inv.paternalSurname} {inv.maternalSurname}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pct === 100 ? 'bg-green-100 text-green-700' : esDivorcio ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {entregados}/{total}
                                    </span>
                                </div>
                                {/* Barra de progreso */}
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                                    <div
                                        className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : esDivorcio ? 'bg-orange-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                {/* Lista de requisitos */}
                                <div className="space-y-1.5">
                                    {reqs.map(r => {
                                        const nombre = reqNamesMap.get(extractReqId(r.requirementId)) ?? `Requisito ${extractReqId(r.requirementId)}`;
                                        return (
                                            <div key={String(r.requirementId)} className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm ${r.delivered === 1 ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'}`}>
                                                <i className={`fas mt-0.5 ${r.delivered === 1 ? 'fa-check-circle text-green-500' : 'fa-times-circle text-gray-300'}`}></i>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium leading-tight ${r.delivered === 1 ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{nombre}</p>
                                                    {r.observation && (
                                                        <p className="text-xs text-gray-500 mt-0.5 italic">
                                                            <i className="fas fa-comment-alt mr-1"></i>{r.observation}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded ${r.delivered === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {r.delivered === 1 ? 'Presentado' : 'Pendiente'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Requisitos Generales */}
                    {generalReqs.length > 0 && (
                        <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                                <i className={`fas fa-layer-group text-base ${esDivorcio ? 'text-orange-400' : 'text-violet-400'}`}></i>
                                <span className="text-sm font-semibold text-gray-800">Requisitos Generales</span>
                                <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${generalReqs.filter(r => r.delivered === 1).length === generalReqs.length ? 'bg-green-100 text-green-700' : esDivorcio ? 'bg-orange-100 text-orange-700' : 'bg-violet-100 text-violet-700'}`}>
                                    {generalReqs.filter(r => r.delivered === 1).length}/{generalReqs.length}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {generalReqs.map(r => {
                                    const nombre = reqNamesMap.get(extractReqId(r.requirementId)) ?? `Requisito ${extractReqId(r.requirementId)}`;
                                    return (
                                        <div key={String(r.requirementId)} className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm ${r.delivered === 1 ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'}`}>
                                            <i className={`fas mt-0.5 ${r.delivered === 1 ? 'fa-check-circle text-green-500' : 'fa-times-circle text-gray-300'}`}></i>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium leading-tight ${r.delivered === 1 ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{nombre}</p>
                                                {r.observation && (
                                                    <p className="text-xs text-gray-500 mt-0.5 italic">
                                                        <i className="fas fa-comment-alt mr-1"></i>{r.observation}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded ${r.delivered === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                {r.delivered === 1 ? 'Presentado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Sección de Testigos — solo matrimonio ─── */}            {esMatrimonio && testigos.length > 0 && (
                <div className="mt-6 bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-users text-green-600"></i>
                        Testigos ({testigos.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {testigos.map((testigo: Participant, index: number) => (
                            <div key={testigo.cui} className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <i className="fas fa-user-check text-green-500"></i>
                                    Testigo {index + 1}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs text-gray-500">Nombres Completos:</span>
                                        <p className="text-sm font-medium text-gray-900">
                                            {testigo.names} {testigo.paternalSurname} {testigo.maternalSurname}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">DNI:</span>
                                        <p className="text-sm font-medium text-gray-900">{testigo.cui}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Sexo:</span>
                                        <p className="text-sm font-medium text-gray-900">
                                            {testigo.gender === 'M' ? 'Masculino' : 'Femenino'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Estado Civil:</span>
                                        <p className="text-sm font-medium text-gray-900">{testigo.maritalStatus}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Teléfono:</span>
                                        <p className="text-sm font-medium text-gray-900">{testigo.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Email:</span>
                                        <p className="text-sm font-medium text-gray-900">{testigo.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Sección de Detalles del Matrimonio — solo matrimonio ─── */}
            {esMatrimonio && marriageDetails && (
                marriageDetails.marriageDate ||
                marriageDetails.marriagePlace ||
                marriageDetails.marriageTime ||
                marriageDetails.marriageOfficiantId
            ) && (
                <div className="mt-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-ring text-purple-600"></i>
                        Detalles del Matrimonio
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-3">
                            <i className="fas fa-calendar-alt text-purple-500 mt-0.5"></i>
                            <div>
                                <span className="text-xs text-gray-500">Fecha del Matrimonio:</span>
                                <p className="text-sm font-medium text-gray-900">{formatearFecha(marriageDetails.marriageDate)}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-3">
                            <i className="fas fa-clock text-purple-500 mt-0.5"></i>
                            <div>
                                <span className="text-xs text-gray-500">Hora del Matrimonio:</span>
                                <p className="text-sm font-medium text-gray-900">{marriageDetails.marriageTime || 'No especificada'}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-3">
                            <i className="fas fa-map-marker-alt text-purple-500 mt-0.5"></i>
                            <div>
                                <span className="text-xs text-gray-500">Lugar del Matrimonio:</span>
                                <p className="text-sm font-medium text-gray-900">{marriageDetails.marriagePlace || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-3">
                            <i className="fas fa-user-tie text-purple-500 mt-0.5"></i>
                            <div>
                                <span className="text-xs text-gray-500">Oficiante:</span>
                                <p className="text-sm font-medium text-gray-900">
                                    {oficianteEncontrado
                                        ? oficianteEncontrado.full_name
                                        : (marriageDetails.marriageOfficiantId
                                            ? `ID: ${marriageDetails.marriageOfficiantId}`
                                            : 'No asignado')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <i className="fas fa-info-circle text-amber-600 mt-0.5"></i>
                <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Importante:</p>
                    <p>
                        Al confirmar esta solicitud, se enviará al sistema para su procesamiento. Puede hacer seguimiento del
                        trámite desde el panel principal.
                    </p>
                </div>
            </div>

            {/* Botón de confirmación */}
            <div className="mt-6 flex justify-center">
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className={`
                        px-8 py-3 rounded-lg font-semibold text-white
                        transition-all duration-300 transform
                        ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
                        }
                    `}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <i className="fas fa-spinner fa-spin"></i>
                            Enviando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            Confirmar y Enviar Solicitud
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}