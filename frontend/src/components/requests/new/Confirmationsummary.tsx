import type { CreateApplicationPayload } from "../../../model/aplicationModel.ts";
import type { Participant } from "../../../model/aplicationModel.ts";

interface ConfirmationSummaryProps {
    tipoSolicitud: number | null;
    tipoNombre: string | undefined;
    precio: number | undefined;
    descriptionSolicitud: string | undefined;
    applicationData: CreateApplicationPayload;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export default function ConfirmationSummary({
    tipoNombre,
    descriptionSolicitud,
    precio,
    applicationData,
    onConfirm,
    isSubmitting
}: ConfirmationSummaryProps) {
    // Extraer datos del solicitante principal (participante con role 'solicitante')
    const solicitante = applicationData.participants.find(p => p.rol === 'solicitante');

    // Extraer contrayentes y testigos
    const contrayentes = applicationData.participants.filter(p => p.rol === 'contrayente');
    const testigos = applicationData.participants.filter(p => p.rol === 'testigo');

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

                {/* Mostrar número de expediente si existe */}
                {applicationData.application.expedientNumber && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">N° Expediente:</span>
                        <span className="font-semibold text-blue-600">{applicationData.application.expedientNumber}</span>
                    </div>
                )}

                {/* Mostrar participantes adicionales */}
                {applicationData.participants.length > 1 && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">Participantes:</span>
                        <span className="font-semibold text-gray-900">{applicationData.participants.length} persona(s)</span>
                    </div>
                )}

                {/* Mostrar requisitos si existen */}
                {applicationData.requirements && applicationData.requirements.length > 0 && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">Requisitos:</span>
                        <span className="font-semibold text-gray-900">
                            {applicationData.requirements.filter(r => r.delivered === 1).length} de {applicationData.requirements.length} completados
                        </span>
                    </div>
                )}
                {/* Mostrar Precio de solicitud */}
                <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Precio:</span>
                    <span className="font-semibold text-gray-900">
                        S/. {precio} 
                    </span>
                </div>

            </div>

            {/* Sección de Contrayentes */}
            {contrayentes.length > 0 && (
                <div className="mt-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-user-friends text-blue-600"></i>
                        Contrayentes ({contrayentes.length})
                    </h3>
                    <div className="space-y-4">
                        {contrayentes.map((contrayente: Participant, index: number) => (
                            <div key={contrayente.cui} className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <i className="fas fa-user-circle text-blue-500"></i>
                                    Contrayente {index + 1}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs text-gray-500">Nombres Completos:</span>
                                        <p className="text-sm font-medium text-gray-900">
                                            {contrayente.names} {contrayente.paternalSurname} {contrayente.maternalSurname}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">DNI:</span>
                                        <p className="text-sm font-medium text-gray-900">{contrayente.cui}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Sexo:</span>
                                        <p className="text-sm font-medium text-gray-900">
                                            {contrayente.gender === 'M' ? 'Masculino' : 'Femenino'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Estado Civil:</span>
                                        <p className="text-sm font-medium text-gray-900">{contrayente.maritalStatus}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Teléfono:</span>
                                        <p className="text-sm font-medium text-gray-900">{contrayente.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Email:</span>
                                        <p className="text-sm font-medium text-gray-900">{contrayente.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sección de Testigos */}
            {testigos.length > 0 && (
                <div className="mt-6 bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-users text-green-600"></i>
                        Testigos ({testigos.length})
                    </h3>
                    <div className="space-y-4">
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