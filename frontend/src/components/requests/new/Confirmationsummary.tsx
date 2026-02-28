import type { CreateApplicationPayload } from "../../../model/aplicationModel.ts";
import type { Participant } from "../../../model/aplicationModel.ts";
import { useGetOficiantes } from "../../../hooks/useGetOficiantes.ts";
import { detectFlowType } from "../../../config/stepsConfig.ts";

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

            {/* ─── Sección de Testigos — solo matrimonio ─── */}
            {esMatrimonio && testigos.length > 0 && (
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